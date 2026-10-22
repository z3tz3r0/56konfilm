import {
  at,
  create,
  del,
  patch,
  set,
  transaction,
  type AsyncIterableMigration,
} from 'sanity/migrate';
import {
  CMS_CREDENTIALS_ID,
  CMS_CREDENTIALS_TYPE,
  LEGACY_CMS_CREDENTIALS_ID,
  hasCredentialValues,
  type CredentialDocument,
} from '../../src/shared/lib/auth/credentialDocument';

interface Snapshot {
  _id: string;
  _type: string;
  _rev: string;
  [field: string]: unknown;
}
export class CredentialMigrationError extends Error {}

const allowedFields = new Set([
  '_id',
  '_type',
  '_rev',
  '_createdAt',
  '_updatedAt',
  'username',
  'password',
  'updatedAt',
]);
const PREVIEW = '[REDACTED — PREVIEW ONLY]';

function credential(document: Snapshot): CredentialDocument {
  const { _id, _type, _rev, username, password, updatedAt } = document;
  if (
    _type !== CMS_CREDENTIALS_TYPE ||
    !_rev ||
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    (updatedAt !== undefined && typeof updatedAt !== 'string') ||
    Object.keys(document).some((field) => !allowedFields.has(field))
  ) {
    throw new CredentialMigrationError(
      'Invalid or unexpected credential data. Resolve it before migrating.'
    );
  }
  const result = {
    _id,
    _type,
    _rev,
    username,
    password,
    ...(updatedAt === undefined ? {} : { updatedAt }),
  };
  if (!hasCredentialValues(result))
    throw new CredentialMigrationError('Stored credential values are invalid.');
  return result;
}

/** Validate every record before producing any mutation; never promote a draft. */
export function planCredentialMigration(documents: Snapshot[]) {
  if (
    documents.some(
      (document) =>
        document._id !== LEGACY_CMS_CREDENTIALS_ID &&
        document._id !== CMS_CREDENTIALS_ID
    )
  ) {
    throw new CredentialMigrationError(
      'Unexpected credential documents, drafts or releases exist. Resolve them before migrating.'
    );
  }
  if (
    !documents.length ||
    new Set(documents.map((doc) => doc._id)).size !== documents.length
  ) {
    throw new CredentialMigrationError(
      'Credentials are missing or ambiguous. Verify project and dataset; use protected setup for a new installation.'
    );
  }
  const records = documents.map(credential);
  const source = records.find((doc) => doc._id === LEGACY_CMS_CREDENTIALS_ID);
  const target = records.find((doc) => doc._id === CMS_CREDENTIALS_ID);
  if (
    source &&
    target &&
    (source.username !== target.username ||
      source.password !== target.password ||
      source.updatedAt !== target.updatedAt)
  ) {
    throw new CredentialMigrationError(
      'Source and protected credentials differ. Refusing to overwrite either record.'
    );
  }
  return { source, target };
}

function guard(document: CredentialDocument, dryRun: boolean) {
  // A non-empty identity patch is deliberately retained: del() itself has no CAS.
  return patch(
    document._id,
    [at('username', set(dryRun ? PREVIEW : document.username))],
    { ifRevision: document._rev }
  );
}

/** Only yields native declarations. The CLI executes one guarded, atomic move. */
export const migrateCredentials: AsyncIterableMigration = async function* (
  documents,
  context
) {
  const snapshots: Snapshot[] = [];
  for await (const document of documents()) snapshots.push(document);
  const { source, target } = planCredentialMigration(snapshots);

  if (!context.dryRun) {
    try {
      // fetch() is supported by the native runner's Proxy; getDocuments() is not.
      // Query-index checks supplement, but do not replace, transaction revision guards.
      const current = await context.client.fetch<{
        credentials: Snapshot[];
        references: number;
      }>(
        '{"credentials": *[_type == $type || _id in $ids], "references": count(*[references($sourceId)])}',
        {
          type: CMS_CREDENTIALS_TYPE,
          ids: [CMS_CREDENTIALS_ID, LEGACY_CMS_CREDENTIALS_ID],
          sourceId: LEGACY_CMS_CREDENTIALS_ID,
        },
        { perspective: 'raw', useCdn: false, cache: 'no-store' }
      );
      planCredentialMigration(current.credentials);
      if (
        current.references !== 0 ||
        current.credentials.length !== snapshots.length ||
        snapshots.some(
          (snapshot) =>
            !current.credentials.some(
              (doc) => doc._id === snapshot._id && doc._rev === snapshot._rev
            )
        )
      ) {
        throw new CredentialMigrationError(
          'Credential revisions, references or document set changed. Pause writes and rerun the preview.'
        );
      }
    } catch (error) {
      if (error instanceof CredentialMigrationError) throw error;
      throw new CredentialMigrationError(
        'Credential preflight failed. Verify operator permissions without sharing SDK error payloads.'
      );
    }
  }

  if (!source) return;
  const creation = {
    _id: CMS_CREDENTIALS_ID,
    _type: CMS_CREDENTIALS_TYPE,
    username: context.dryRun ? PREVIEW : source.username,
    password: context.dryRun ? PREVIEW : source.password,
    ...(source.updatedAt === undefined ? {} : { updatedAt: source.updatedAt }),
  };
  yield transaction([
    guard(source, context.dryRun),
    ...(target ? [guard(target, context.dryRun)] : [create(creation)]),
    del(source._id),
  ]);
};
