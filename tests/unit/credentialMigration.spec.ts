// @vitest-environment node
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { SanityDocument } from 'sanity';
import {
  collectMigrationMutations,
  type MigrationContext,
  type Transaction,
} from 'sanity/migrate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import migration from '../../migrations/protect-cms-credentials';
import { planCredentialMigration } from '../../migrations/protect-cms-credentials/credentialMigration';
import {
  CREDENTIAL_MIGRATION_ID,
  CREDENTIAL_MIGRATION_RUNNER,
} from '../../migrations/protect-cms-credentials/runnerGuard';
import {
  CMS_CREDENTIALS_ID,
  LEGACY_CMS_CREDENTIALS_ID,
} from '@shared/lib/auth/credentialDocument';

const hash = '$2b$12$' + 'a'.repeat(53);
const username = 'fixture-sensitive-editor';
const source = (overrides: Record<string, unknown> = {}): SanityDocument => ({
  _id: LEGACY_CMS_CREDENTIALS_ID,
  _type: 'cmsCredentials',
  _rev: 'source-rev',
  _createdAt: '2020-01-01T00:00:00.000Z',
  _updatedAt: '2020-01-02T00:00:00.000Z',
  username,
  password: hash,
  updatedAt: '2020-01-02T00:00:00.000Z',
  ...overrides,
});
const target = (overrides: Record<string, unknown> = {}) =>
  source({ _id: CMS_CREDENTIALS_ID, _rev: 'target-rev', ...overrides });

beforeEach(() => {
  vi.stubEnv(CREDENTIAL_MIGRATION_RUNNER, CREDENTIAL_MIGRATION_ID);
});
afterEach(() => vi.unstubAllEnvs());

function fixture(documents: SanityDocument[], dryRun = true) {
  const fetch = vi
    .fn()
    .mockResolvedValue({ credentials: documents, references: 0 });
  // Only the native context's read boundary is mocked; collection/helpers are real.
  const context = { dryRun, client: { fetch } } as unknown as MigrationContext;
  async function* snapshots() {
    yield* documents;
  }
  const generate = async () => {
    const mutations: Transaction[] = [];
    for await (const mutation of collectMigrationMutations(
      migration,
      snapshots,
      context
    )) {
      for (const item of Array.isArray(mutation) ? mutation : [mutation]) {
        if (item.type !== 'transaction')
          throw new Error('Expected an explicit transaction');
        mutations.push(item);
      }
    }
    return mutations;
  };
  return { generate, fetch };
}

describe('Protected credential migration planning', () => {
  it('uses the native migration anatomy and a single protected destination', () => {
    expect(migration.documentTypes).toEqual(['cmsCredentials']);
    expect(migration.migrate).toBeTypeOf('function');
    expect(CMS_CREDENTIALS_ID).toBe('private.cms-credentials');
  });

  it('preserves business values and does not modify snapshots', () => {
    const input = source();
    const original = structuredClone(input);
    const plan = planCredentialMigration([input]);
    expect(plan.source).toMatchObject({
      username,
      password: hash,
      updatedAt: input.updatedAt,
    });
    expect(plan.source).not.toHaveProperty('_createdAt');
    expect(input).toEqual(original);
  });

  it.each(
    [
      [],
      [source({ _rev: '' })],
      [source({ password: 'plaintext' })],
      [source({ username: ' ' })],
      [source({ _type: 'wrong-type' })],
      [source({ extra: ['unkeyed-array'] })],
      [source(), source()],
      [source({ updatedAt: 123 })],
    ].map((records) => ({ records }))
  )(
    'rejects missing, malformed or ambiguous inputs without secret-bearing errors (%#)',
    ({ records }) => {
      expect(() => planCredentialMigration(records)).toThrow();
      try {
        planCredentialMigration(records);
      } catch (error) {
        expect(String(error)).not.toContain(hash);
        expect(String(error)).not.toContain(username);
      }
    }
  );

  it.each([
    'drafts.cms-credentials',
    'drafts.private.cms-credentials',
    'versions.release.cms-credentials',
    'another-root-account',
  ])('refuses to guess what to do with %s', (id) => {
    expect(() =>
      planCredentialMigration([source(), source({ _id: id })])
    ).toThrow('Unexpected credential documents');
  });

  it.each([
    { username: 'other' },
    { password: '$2b$12$' + 'b'.repeat(53) },
    { updatedAt: '2050-01-01' },
  ])('does not overwrite conflicting target values (%#)', (difference) => {
    expect(() =>
      planCredentialMigration([source(), target(difference)])
    ).toThrow('differ');
  });
});

describe('Protected credentials with the native mutation collector', () => {
  it.each([undefined, '', 'another-runner'])(
    'blocks direct native apply before reading snapshots or live data (marker=%s)',
    async (marker) => {
      vi.stubEnv(CREDENTIAL_MIGRATION_RUNNER, marker);
      const read = vi.fn();
      const fetch = vi.fn();
      async function* documents() {
        read();
        yield source();
      }
      const context = {
        dryRun: false,
        client: { fetch },
      } as unknown as MigrationContext;
      const collect = async () => {
        for await (const _mutation of collectMigrationMutations(
          migration,
          documents,
          context
        )) {
          throw new Error('Direct apply must not yield mutations');
        }
      };
      await expect(collect()).rejects.toThrow('Apply requires the safe runner');
      expect(read).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    }
  );

  it('allows a direct redacted native dry-run without the runner marker', async () => {
    vi.stubEnv(CREDENTIAL_MIGRATION_RUNNER, undefined);
    const changes = await fixture([source()]).generate();
    expect(changes).toHaveLength(1);
    expect(JSON.stringify(changes)).not.toContain(hash);
    expect(JSON.stringify(changes)).not.toContain(username);
  });

  it('retains the CAS and strict create/delete when encoded by the installed native runner', async () => {
    const requireFromSanity = createRequire(
      createRequire(import.meta.url).resolve('sanity')
    );
    const directory = dirname(
      requireFromSanity.resolve('@sanity/migrate/package.json')
    );
    const { toSanityMutations } = await import(
      pathToFileURL(
        resolve(directory, 'dist/runner/utils/toSanityMutations.js')
      ).href
    );
    const changes = await fixture([source()], false).generate();
    async function* stream() {
      yield* changes;
    }
    const encoded = [];
    for await (const value of toSanityMutations(stream())) encoded.push(value);
    expect(encoded).toEqual([
      {
        mutations: [
          {
            patch: {
              id: LEGACY_CMS_CREDENTIALS_ID,
              ifRevisionID: 'source-rev',
              set: { username },
            },
          },
          {
            create: {
              _id: CMS_CREDENTIALS_ID,
              _type: 'cmsCredentials',
              username,
              password: hash,
              updatedAt: source().updatedAt,
            },
          },
          { delete: { id: LEGACY_CMS_CREDENTIALS_ID } },
        ],
      },
    ]);
  });

  it('keeps the native CLI preview formatter free of credential values', async () => {
    const requireFromSanity = createRequire(
      createRequire(import.meta.url).resolve('sanity')
    );
    const directory = dirname(
      requireFromSanity.resolve('@sanity/migrate/package.json')
    );
    const { prettyFormat } = await import(
      pathToFileURL(
        resolve(directory, 'dist/utils/migration/prettyMutationFormatter.js')
      ).href
    );
    const preview = prettyFormat({
      migration,
      subject: await fixture([source()], true).generate(),
    });
    expect(preview).toContain('REDACTED');
    expect(preview).not.toContain(username);
    expect(preview).not.toContain(hash);
    // Negative control: the stock apply formatter is unsafe unless progress is disabled.
    const unredacted = prettyFormat({
      migration,
      subject: await fixture([source()], false).generate(),
    });
    expect(unredacted).toContain(hash);
  });

  it('redacts dry-run create and guard values without changing the snapshot or fetching live data', async () => {
    const input = [source()];
    const before = structuredClone(input);
    const { generate, fetch } = fixture(input);
    const changes = await generate();
    expect(changes).toHaveLength(1);
    expect(changes[0].mutations.map((mutation) => mutation.type)).toEqual([
      'patch',
      'create',
      'delete',
    ]);
    expect(JSON.stringify(changes)).not.toContain(hash);
    expect(JSON.stringify(changes)).not.toContain(username);
    expect(JSON.stringify(changes)).toContain('REDACTED');
    expect(changes[0].mutations[0]).toMatchObject({
      id: LEGACY_CMS_CREDENTIALS_ID,
      options: { ifRevision: 'source-rev' },
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(input).toEqual(before);
  });

  it('declares strict creation and revision-guarded source removal in one atomic transaction', async () => {
    const { generate, fetch } = fixture([source()], false);
    const changes = await generate();
    expect(changes).toEqual([
      {
        type: 'transaction',
        mutations: [
          {
            type: 'patch',
            id: LEGACY_CMS_CREDENTIALS_ID,
            patches: [
              { path: ['username'], op: { type: 'set', value: username } },
            ],
            options: { ifRevision: 'source-rev' },
          },
          {
            type: 'create',
            document: {
              _id: CMS_CREDENTIALS_ID,
              _type: 'cmsCredentials',
              username,
              password: hash,
              updatedAt: source().updatedAt,
            },
          },
          { type: 'delete', id: LEGACY_CMS_CREDENTIALS_ID },
        ],
      },
    ]);
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ sourceId: LEGACY_CMS_CREDENTIALS_ID }),
      { perspective: 'raw', useCdn: false, cache: 'no-store' }
    );
    expect(JSON.stringify(changes)).not.toContain('REDACTED');
  });

  it.each([true, false])(
    'only guards an identical existing destination, without recreating it (dry=%s)',
    async (dry) => {
      const changes = await fixture([source(), target()], dry).generate();
      expect(changes[0].mutations.map((mutation) => mutation.type)).toEqual([
        'patch',
        'patch',
        'delete',
      ]);
      expect(changes[0].mutations[1]).toMatchObject({
        id: CMS_CREDENTIALS_ID,
        options: { ifRevision: 'target-rev' },
      });
      if (dry) {
        expect(JSON.stringify(changes)).not.toContain(hash);
        expect(JSON.stringify(changes)).not.toContain(username);
      }
    }
  );

  it.each([true, false])(
    'is idempotent after the public source is removed (dry=%s)',
    async (dry) => {
      expect(await fixture([target()], dry).generate()).toEqual([]);
    }
  );

  it.each([
    'source changed',
    'source removed',
    'target appeared',
    'draft appeared',
    'references appeared',
  ])('rechecks %s before yielding any transaction', async (change) => {
    const { generate, fetch } = fixture([source()], false);
    fetch.mockResolvedValue({
      credentials:
        change === 'source removed'
          ? [target()]
          : change === 'source changed'
            ? [source({ _rev: 'concurrent' })]
            : change === 'target appeared'
              ? [source(), target()]
              : change === 'draft appeared'
                ? [source(), source({ _id: 'drafts.cms-credentials' })]
                : [source()],
      references: change === 'references appeared' ? 1 : 0,
    });
    await expect(generate()).rejects.toThrow();
  });

  it('does not pass SDK preflight secrets through its error', async () => {
    const { generate, fetch } = fixture([source()], false);
    fetch.mockRejectedValue(new Error(`${hash} bearer secret-token`));
    await expect(generate()).rejects.toThrow('Credential preflight failed');
    try {
      await generate();
    } catch (error) {
      expect(String(error)).not.toContain(hash);
      expect(String(error)).not.toContain('secret-token');
    }
  });

  it.each(['source revision', 'target collision'] as const)(
    'cannot partially apply an atomic transaction after a concurrent %s',
    async (conflict) => {
      const [change] = await fixture([source()], false).generate();
      const storage = new Map<string, SanityDocument>([
        [LEGACY_CMS_CREDENTIALS_ID, source()],
      ]);
      if (conflict === 'source revision')
        storage.set(
          LEGACY_CMS_CREDENTIALS_ID,
          source({ _rev: 'changed-after-preflight' })
        );
      else
        storage.set(
          CMS_CREDENTIALS_ID,
          target({ password: '$2b$12$' + 'c'.repeat(53) })
        );
      const original = structuredClone(storage);
      // Transaction fixture models server CAS/strict-create semantics on a private copy.
      const apply = () => {
        const pending = structuredClone(storage);
        for (const mutation of change.mutations) {
          if (
            mutation.type === 'patch' &&
            pending.get(mutation.id)?._rev !== mutation.options?.ifRevision
          )
            throw new Error('Revision conflict');
          if (mutation.type === 'create') {
            if (pending.has(mutation.document._id))
              throw new Error('Create conflict');
            pending.set(mutation.document._id, target());
          }
          if (mutation.type === 'delete') pending.delete(mutation.id);
        }
        storage.clear();
        for (const [id, document] of pending) storage.set(id, document);
      };
      expect(apply).toThrow(/conflict/);
      expect(storage).toEqual(original);
    }
  );
});
