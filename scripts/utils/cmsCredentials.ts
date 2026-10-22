import bcrypt from 'bcryptjs';
import type { SanityClient } from 'next-sanity';
import {
  CMS_CREDENTIALS_ID,
  CMS_CREDENTIALS_TYPE,
  LEGACY_CMS_CREDENTIALS_ID,
  hasCredentialValues,
  type CredentialDocument,
} from '../../src/shared/lib/auth/credentialDocument';

export type CredentialSetupMode =
  | '--create'
  | '--update'
  | '--reset'
  | '--delete';
export function isCredentialSetupMode(
  value: string
): value is CredentialSetupMode {
  return (
    value === '--create' ||
    value === '--update' ||
    value === '--reset' ||
    value === '--delete'
  );
}
export interface CredentialPrompts {
  question: (prompt: string) => Promise<string>;
  hidden: (prompt: string) => Promise<string>;
  log: (message: string) => void;
}
export class CredentialSetupError extends Error {}

async function newPassword(prompts: CredentialPrompts) {
  const password = await prompts.hidden('New Password: ');
  if (!password.trim()) throw new CredentialSetupError('Password is required.');
  const confirmation = await prompts.hidden('Confirm New Password: ');
  if (password !== confirmation) {
    throw new CredentialSetupError('Passwords do not match.');
  }
  return bcrypt.hash(password, 12);
}

/** All four modes are testable without starting the CLI or loading .env.local. */
export async function runCredentialSetup(
  client: SanityClient,
  mode: CredentialSetupMode,
  prompts: CredentialPrompts
) {
  try {
    const documents = await client.fetch<CredentialDocument[]>(
      '*[_type == $type || _id in $ids]',
      {
        type: CMS_CREDENTIALS_TYPE,
        ids: [CMS_CREDENTIALS_ID, LEGACY_CMS_CREDENTIALS_ID],
      },
      { perspective: 'raw', cache: 'no-store' }
    );
    if (documents.some((document) => document._id !== CMS_CREDENTIALS_ID)) {
      throw new CredentialSetupError(
        'Legacy or unexpected credential documents exist. Run protect-cms-credentials migration first.'
      );
    }
    const existing = documents[0];
    if (
      documents.length > 1 ||
      (existing &&
        (existing._type !== CMS_CREDENTIALS_TYPE ||
          !existing._rev ||
          !hasCredentialValues(existing)))
    ) {
      throw new CredentialSetupError(
        'Stored credentials are invalid. Resolve the protected document before continuing.'
      );
    }

    if (mode === '--delete') {
      if (!existing) {
        prompts.log('No protected credentials to delete.');
        return;
      }
      if (
        (
          await prompts.question('Delete protected CMS credentials? (y/N): ')
        ).toLowerCase() !== 'y'
      )
        return;
      // Delete has no revision option; guard it with an identity patch in the same transaction.
      await client
        .transaction()
        .patch(CMS_CREDENTIALS_ID, (patch) =>
          patch.ifRevisionId(existing._rev).set({ username: existing.username })
        )
        .delete(CMS_CREDENTIALS_ID)
        .commit({ returnDocuments: false });
      prompts.log('Protected credentials deleted.');
      return;
    }

    let username: string;
    let password: string;
    if (mode === '--update') {
      if (!existing)
        throw new CredentialSetupError(
          'No protected credentials. Use --create first.'
        );
      const current = await prompts.hidden('Current Password: ');
      if (!(await bcrypt.compare(current, existing.password))) {
        throw new CredentialSetupError('Current password is incorrect.');
      }
      username = existing.username;
      password = existing.password;
      if (
        (await prompts.question('Update username? (y/N): ')).toLowerCase() ===
        'y'
      ) {
        username = (await prompts.question('New Username: ')).trim();
      }
      if (
        (await prompts.question('Update password? (y/N): ')).toLowerCase() ===
        'y'
      ) {
        password = await newPassword(prompts);
      }
    } else {
      if (
        existing &&
        (
          await prompts.question('Replace protected CMS credentials? (y/N): ')
        ).toLowerCase() !== 'y'
      )
        return;
      username = (await prompts.question('Username: ')).trim();
      password = await newPassword(prompts);
    }
    if (!username) throw new CredentialSetupError('Username is required.');
    const values = { username, password, updatedAt: new Date().toISOString() };
    if (existing) {
      // Reset replaces values only after all prompts succeed, never delete then create.
      await client
        .patch(CMS_CREDENTIALS_ID)
        .ifRevisionId(existing._rev)
        .set(values)
        .commit({ returnDocuments: false });
    } else {
      await client.create(
        { _id: CMS_CREDENTIALS_ID, _type: CMS_CREDENTIALS_TYPE, ...values },
        { returnDocuments: false }
      );
    }
    prompts.log('Protected credentials saved.');
  } catch (error) {
    if (error instanceof CredentialSetupError) throw error;
    // Never pass SDK error/request objects to an interactive console or CI log.
    throw new CredentialSetupError(
      'Credential operation failed. Check token permissions and concurrent changes, then retry.'
    );
  }
}
