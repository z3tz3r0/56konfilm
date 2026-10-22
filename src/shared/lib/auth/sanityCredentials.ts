import 'server-only';
import { getCredentialClient } from '@/sanity/lib/serverClient';
import {
  CMS_CREDENTIALS_ID,
  CMS_CREDENTIALS_TYPE,
  hasCredentialValues,
  type CmsCredentials,
} from './credentialDocument';

/**
 * Get credentials from Sanity
 */
export async function getCredentialsFromSanity(): Promise<CmsCredentials | null> {
  try {
    const credentials =
      await getCredentialClient().fetch<CmsCredentials | null>(
        `*[_type == $type && _id == $id][0] {
        username,
        password
      }`,
        { type: CMS_CREDENTIALS_TYPE, id: CMS_CREDENTIALS_ID },
        { cache: 'no-store', perspective: 'raw' }
      );

    return credentials && hasCredentialValues(credentials) ? credentials : null;
  } catch {
    // SDK errors can contain request payloads or authorization details.
    console.error('CMS credential read failed.');
    return null;
  }
}

/**
 * Update password in Sanity
 */
export async function updatePasswordInSanity(
  newPasswordHash: string
): Promise<void> {
  try {
    await getCredentialClient()
      .patch(CMS_CREDENTIALS_ID)
      .set({
        password: newPasswordHash,
        updatedAt: new Date().toISOString(),
      })
      .commit();
  } catch {
    console.error('CMS credential update failed.');
    throw new Error('Failed to update password');
  }
}
