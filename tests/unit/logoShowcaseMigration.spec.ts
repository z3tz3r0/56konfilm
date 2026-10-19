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
import { beforeAll, describe, expect, it, vi } from 'vitest';
import migration from '../../migrations/rename-logo-grid-to-logo-showcase';
import { planLogoShowcaseMigration } from '../../migrations/rename-logo-grid-to-logo-showcase/logoShowcaseMigration';

const oldType = 'logoGridSection';
const newType = 'logoShowcaseSection';
const logoSection = (key = 'logos') => ({
  _key: key,
  _type: oldType,
  title: [{ _key: 'random-key', language: 'th', value: 'ลูกค้าของเรา' }],
  background: 'contrast',
  logos: [2, 0, 1].map((index) => ({
    _key: `logo-${index}`,
    image: {
      asset: { _ref: `image-${index}` },
      crop: { top: 0.1, bottom: 0, left: 0, right: 0 },
      hotspot: { x: 0.5, y: 0.5, width: 1, height: 1 },
    },
    alt: [{ _key: 'random-key', language: 'th', value: `แบรนด์ ${index}` }],
  })),
});

describe('Logo Showcase with the installed native SDK wrapper', () => {
  let createContextClient: (
    config: Record<string, unknown>
  ) => MigrationContext['client'];
  let response: (value: unknown) => unknown;

  beforeAll(async () => {
    const requireFromSanity = createRequire(
      createRequire(import.meta.url).resolve('sanity')
    );
    const migratePackage = requireFromSanity.resolve(
      '@sanity/migrate/package.json'
    );
    // Test-only access to the runner's actual wrapper; no application env or CLI startup.
    ({ createContextClient } = await import(
      pathToFileURL(
        resolve(
          dirname(migratePackage),
          'dist/runner/utils/createContextClient.js'
        )
      ).href
    ));
    const requireFromMigrate = createRequire(migratePackage);
    const requireFromClient = createRequire(
      requireFromMigrate.resolve('@sanity/client')
    );
    const { of } = requireFromClient('rxjs');
    response = (body) =>
      of({ type: 'response', statusCode: 200, headers: {}, body });
  });

  /** Stop at the SDK HTTP boundary: exercise real methods and Proxy bindings, never a service. */
  function sdkContext(
    currentPages: SanityDocument[],
    dryRun = false,
    apiVersion = '2025-02-19'
  ) {
    const request = vi.fn(
      (options: {
        url: string;
        method: string;
        query?: Record<string, unknown>;
      }) => {
        const url = new URL(options.url);
        if (
          options.method !== 'GET' ||
          !url.pathname.endsWith('/data/query/fixture')
        ) {
          throw new Error(
            'Unexpected SDK request; no network fallback is permitted.'
          );
        }
        const ids: string[] = JSON.parse(url.searchParams.get('$ids') ?? '[]');
        return response({
          result: currentPages
            .filter((page) => ids.includes(page._id))
            .map(({ _id, _rev }) => ({ _id, _rev })),
        });
      }
    );
    const client = createContextClient({
      projectId: 'fixture',
      dataset: 'fixture',
      apiVersion,
      perspective: 'published',
      useCdn: true,
      maxRetries: 0,
      _requestHandler: request,
    });
    const context: MigrationContext = {
      dryRun,
      client,
      filtered: {
        getDocument: vi.fn(async () => undefined),
        getDocuments: vi.fn(async () => []),
      },
    };
    return { context, request };
  }

  it.each([
    ['production', '2024-01-29'],
    ['production', '2025-02-19'],
    ['wedding', '2024-01-29'],
    ['wedding', '2025-02-19'],
  ])(
    'generates a draft transaction with the real SDK (%s, API %s)',
    async (siteMode, apiVersion) => {
      const field =
        siteMode === 'wedding' ? 'weddingSections' : 'commercialSections';
      const source = page({
        siteMode,
        commercialSections: undefined,
        [field]: [logoSection()],
      });
      const original = structuredClone(source);
      const { context, request } = sdkContext([source], false, apiVersion);
      const changes = await generated([source], context);
      expect(changes).toHaveLength(1);
      expect(changes[0].mutations).toMatchObject([
        { type: 'create', document: { _id: 'drafts.page', _type: 'page' } },
        { type: 'patch', id: 'drafts.page', patches: [typePatch(field)] },
      ]);
      expect(request).toHaveBeenCalledOnce();
      const [options] = request.mock.calls[0];
      const url = new URL(options.url);
      expect(url.hostname).toBe('fixture.api.sanity.io');
      expect(url.searchParams.get('query')).toBe('*[_id in $ids]{_id, _rev}');
      expect(JSON.parse(url.searchParams.get('$ids')!)).toEqual([
        'page',
        'drafts.page',
      ]);
      expect(options.query).toMatchObject({ perspective: 'raw' });
      expect(source).toEqual(original);
    }
  );

  it('processes fourteen published-only pages without calling unbound SDK methods', async () => {
    const pages = Array.from({ length: 14 }, (_, i) =>
      page({ _id: `page-${i}` })
    );
    const { context, request } = sdkContext(pages);
    const changes = await generated(pages, context);
    expect(changes).toHaveLength(14);
    expect(request).toHaveBeenCalledTimes(14);
    changes.forEach((change, i) =>
      expect(change.mutations).toMatchObject([
        {
          type: 'create',
          document: { _id: `drafts.page-${i}`, _type: 'page' },
        },
        { type: 'patch', id: `drafts.page-${i}`, patches: [typePatch()] },
      ])
    );
  });

  it.each(['changed revision', 'missing source', 'new draft first'])(
    'fails closed through the real SDK when preflight reports %s',
    async (change) => {
      const source = page();
      const current =
        change === 'missing source'
          ? []
          : change === 'changed revision'
            ? [page({ _rev: 'changed' })]
            : [page({ _id: 'drafts.page' }), source];
      const { context, request } = sdkContext(current);
      async function* documents() {
        yield source;
      }
      await expect(
        collectMigrationMutations(migration, documents, context).next()
      ).rejects.toThrow(/Content changed/);
      expect(request).toHaveBeenCalledOnce();
    }
  );

  it('propagates real SDK transport failures before declaring a draft transaction', async () => {
    const { context, request } = sdkContext([page()]);
    const failure = new Error('Offline transport failure');
    request.mockImplementation(() => {
      throw failure;
    });
    await expect(generated([page()], context)).rejects.toBe(failure);
    expect(request).toHaveBeenCalledOnce();
  });

  it('keeps published dry-runs fully offline even with the real SDK context', async () => {
    const { context, request } = sdkContext([], true);
    expect(await generated([page()], context)).toHaveLength(1);
    expect(request).not.toHaveBeenCalled();
  });

  it('retains the revision guard for existing drafts without any SDK reads', async () => {
    const draft = page({ _id: 'drafts.page', _rev: 'draft-revision' });
    const { context, request } = sdkContext([page(), draft]);
    const changes = await generated([page(), draft], context);
    expect(changes).toHaveLength(1);
    expect(changes[0].mutations).toEqual([
      {
        type: 'patch',
        id: 'drafts.page',
        patches: [typePatch()],
        options: { ifRevision: 'draft-revision' },
      },
    ]);
    expect(request).not.toHaveBeenCalled();
  });

  it('remains idempotent after a draft has been migrated', async () => {
    const pages = [
      page(),
      page({
        _id: 'drafts.page',
        commercialSections: [{ ...logoSection(), _type: newType }],
      }),
    ];
    const { context, request } = sdkContext(pages);
    expect(await generated(pages, context)).toEqual([]);
    expect(request).not.toHaveBeenCalled();
  });
});

/** Build a published page snapshot with a legacy logo section and test overrides. */
function page(overrides: Record<string, unknown> = {}): SanityDocument {
  return {
    _id: 'page',
    _type: 'page',
    _rev: 'revision-1',
    _createdAt: '2026-01-01T00:00:00Z',
    _updatedAt: '2026-01-02T00:00:00Z',
    siteMode: 'production',
    slug: { current: 'home' },
    commercialSections: [
      { _key: 'other', _type: 'heroSection', title: ['Keep this'] },
      logoSection(),
    ],
    ...overrides,
  };
}

const typePatch = (field = 'commercialSections', key = 'logos') => ({
  path: [field, { _key: key }, '_type'],
  op: { type: 'set', value: newType },
});

/** The only live read permitted by the migration is mocked; no client can write. */
function mockContext(pages: SanityDocument[], dryRun = true) {
  const fetch = vi
    .fn()
    .mockImplementation(async (_query: string, { ids }: { ids: string[] }) =>
      pages
        .filter((item) => ids.includes(item._id))
        .map(({ _id, _rev }) => ({ _id, _rev }))
    );
  const context: MigrationContext = {
    dryRun,
    client: { fetch } as unknown as MigrationContext['client'],
    filtered: {
      getDocument: vi.fn(async () => undefined),
      getDocuments: vi.fn(async () => []),
    },
  };
  return { context, fetch };
}

/** Use the actual native entry and collector, but supply all source documents in memory. */
async function generated(pages: SanityDocument[], context: MigrationContext) {
  async function* documents() {
    yield* pages;
  }
  const transactions: Transaction[] = [];
  for await (const change of collectMigrationMutations(
    migration,
    documents,
    context
  )) {
    const batch = Array.isArray(change) ? change : [change];
    if (batch.length !== 1 || batch[0].type !== 'transaction') {
      throw new Error('Each page must be an explicit transaction.');
    }
    transactions.push(batch[0]);
  }
  return transactions;
}

describe('Logo Showcase native migration definition', () => {
  it('exposes a native page migration and keeps all ordinary draft snapshots in scope', async () => {
    expect(migration.documentTypes).toEqual(['page']);
    expect(typeof migration.migrate).toBe('function');
    const requireFromSanity = createRequire(
      createRequire(import.meta.url).resolve('sanity')
    );
    const { parse, evaluate } = requireFromSanity('groq-js');
    const documents = [
      page(),
      page({
        _id: 'drafts.page',
        commercialSections: [{ ...logoSection(), _type: newType }],
      }),
      page({ _id: 'drafts.removed', commercialSections: [] }),
      page({ _id: 'versions.release.page' }),
    ];
    const result = await (
      await evaluate(parse(`*[${migration.filter}]`), { dataset: documents })
    ).get();
    expect(result).toEqual(documents.slice(0, 3));
  });
});

describe('Logo Showcase migration planning', () => {
  it('produces no work for empty, unrelated, or already-migrated pages', () => {
    expect(planLogoShowcaseMigration([])).toEqual([]);
    expect(
      planLogoShowcaseMigration([
        page({ commercialSections: null }),
        page({ _id: 'empty', commercialSections: [] }),
        page({
          _id: 'migrated',
          commercialSections: [{ ...logoSection(), _type: newType }],
        }),
        page({ _id: 'versions.release.page' }),
        page({ _id: 'project', _type: 'project' }),
      ])
    ).toEqual([]);
  });

  it('plans only keyed type patches across both arrays and multiple pages', () => {
    const pages = [
      page({
        commercialSections: [logoSection('first'), logoSection('second')],
        weddingSections: [logoSection('wedding')],
      }),
      page({
        _id: 'wedding-page',
        siteMode: 'wedding',
        commercialSections: undefined,
        weddingSections: [logoSection()],
      }),
    ];
    const originals = structuredClone(pages);
    expect(
      planLogoShowcaseMigration(pages).map(({ targetId, patches }) => ({
        targetId,
        patches,
      }))
    ).toEqual([
      {
        targetId: 'drafts.page',
        patches: [
          typePatch('commercialSections', 'first'),
          typePatch('commercialSections', 'second'),
          typePatch('weddingSections', 'wedding'),
        ],
      },
      {
        targetId: 'drafts.wedding-page',
        patches: [typePatch('weddingSections')],
      },
    ]);
    expect(pages).toEqual(originals);
  });

  it.each([true, false])(
    'prefers the draft regardless of snapshot order (%s)',
    (draftFirst) => {
      const published = page();
      const draft = page({
        _id: 'drafts.page',
        _rev: 'draft-revision',
        slug: { current: 'unpublished-name' },
        commercialSections: [logoSection('draft-only')],
      });
      const plans = planLogoShowcaseMigration(
        draftFirst ? [draft, published] : [published, draft]
      );
      expect(plans).toHaveLength(1);
      expect(plans[0].source).toBe(draft);
      expect(plans[0].patches).toEqual([
        typePatch('commercialSections', 'draft-only'),
      ]);
    }
  );

  it.each([
    { name: 'removed', commercialSections: [] },
    {
      name: 'migrated',
      commercialSections: [{ ...logoSection(), _type: newType }],
    },
  ])(
    'does not resurrect a published section when the draft $name it',
    ({ commercialSections }) => {
      expect(
        planLogoShowcaseMigration([
          page(),
          page({ _id: 'drafts.page', commercialSections }),
        ])
      ).toEqual([]);
    }
  );

  it.each([
    {
      name: 'missing key',
      commercialSections: [{ ...logoSection(), _key: undefined }],
    },
    { name: 'blank key', commercialSections: [logoSection(' ')] },
    {
      name: 'duplicate logo keys',
      commercialSections: [logoSection(), logoSection()],
    },
    {
      name: 'key shared with another section',
      commercialSections: [
        logoSection(),
        { _key: 'logos', _type: 'heroSection' },
      ],
    },
  ])('rejects $name before generating mutations', ({ commercialSections }) => {
    expect(() =>
      planLogoShowcaseMigration([page({ commercialSections })])
    ).toThrow(/Ambiguous or missing section key/);
  });

  it('keeps special characters in structured key paths without interpolating selector syntax', () => {
    const key = 'a"].background';
    expect(
      planLogoShowcaseMigration([
        page({ commercialSections: [logoSection(key)] }),
      ])[0].patches
    ).toEqual([typePatch('commercialSections', key)]);
  });

  it('rejects a missing revision rather than scheduling an unguarded patch', () => {
    expect(() => planLogoShowcaseMigration([page({ _rev: '' })])).toThrow(
      /Missing revision/
    );
  });

  it.each([
    { name: 'missing', entries: [{ _type: 'item' }] },
    { name: 'blank', entries: [{ _key: ' ', _type: 'item' }] },
    { name: 'duplicate', entries: [{ _key: 'same' }, { _key: 'same' }] },
  ])(
    'refuses to copy unrelated arrays with $name keys instead of auto-repairing them',
    ({ entries }) => {
      expect(() =>
        planLogoShowcaseMigration([page({ unrelated: { entries } })])
      ).toThrow(
        /Missing or duplicate array item key at page.unrelated.entries/
      );
    }
  );

  it('checks deeply nested image descriptions before copying a published page', () => {
    const logo = logoSection();
    logo.logos[0].alt[0]._key = '';
    expect(() =>
      planLogoShowcaseMigration([page({ commercialSections: [logo] })])
    ).toThrow(/logos\[0\].alt\[0\]/);
  });

  it('does not repair or block unrelated arrays on existing drafts that are not being copied', () => {
    expect(
      planLogoShowcaseMigration([
        page({ _id: 'drafts.page', unrelated: [{ title: 'Preserve' }] }),
      ])[0].patches
    ).toEqual([typePatch()]);
  });

  it('keeps primitive arrays, nulls, and object properties outside arrays unchanged', () => {
    const source = page({
      values: ['text', 0, false, null],
      object: { nested: { title: 'No key needed' } },
    });
    const original = structuredClone(source);
    expect(planLogoShowcaseMigration([source])).toHaveLength(1);
    expect(source).toEqual(original);
  });
});

describe('Logo Showcase native mutation generation', () => {
  it('generates dry-run declarations from offline snapshots without client reads or writes', async () => {
    const pages = [page()];
    const originals = structuredClone(pages);
    const { context, fetch } = mockContext(pages);
    const result = await generated(pages, context);
    expect(result).toHaveLength(1);
    expect(result[0].mutations.map((mutation) => mutation.type)).toEqual([
      'create',
      'patch',
    ]);
    expect(fetch).not.toHaveBeenCalled();
    expect(pages).toEqual(originals);
  });

  it.each([true, false])(
    'uses a revision-guarded keyed patch for existing drafts (dryRun=%s)',
    async (dryRun) => {
      const draft = page({ _id: 'drafts.page', _rev: 'draft-revision' });
      const original = structuredClone(draft);
      const { context, fetch } = mockContext([page(), draft], dryRun);
      expect(await generated([page(), draft], context)).toEqual([
        {
          type: 'transaction',
          mutations: [
            {
              type: 'patch',
              id: 'drafts.page',
              options: { ifRevision: 'draft-revision' },
              patches: [typePatch()],
            },
          ],
        },
      ]);
      expect(fetch).not.toHaveBeenCalled();
      expect(draft).toEqual(original);
    }
  );

  it('strictly creates a draft copy and changes only section types in one transaction', async () => {
    const source = page();
    const original = structuredClone(source);
    const { context, fetch } = mockContext([source], false);
    const result = await generated([source], context);
    const {
      _rev: _rev,
      _createdAt: _createdAt,
      _updatedAt: _updatedAt,
      ...content
    } = original;
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      '*[_id in $ids]{_id, _rev}',
      { ids: ['page', 'drafts.page'] },
      { perspective: 'raw', useCdn: false }
    );
    expect(result).toEqual([
      {
        type: 'transaction',
        mutations: [
          { type: 'create', document: { ...content, _id: 'drafts.page' } },
          { type: 'patch', id: 'drafts.page', patches: [typePatch()] },
        ],
      },
    ]);
    expect(source).toEqual(original);
  });

  it.each(['changed revision', 'deleted source', 'new draft'])(
    'refuses draft creation after a concurrent change: %s',
    async (change) => {
      const pages = [page()];
      const { context, fetch } = mockContext(pages, false);
      fetch.mockResolvedValue([
        ...(change === 'new draft' ? [page({ _id: 'drafts.page' })] : []),
        ...(change === 'deleted source'
          ? []
          : [
              page({
                _rev:
                  change === 'changed revision' ? 'new-revision' : 'revision-1',
              }),
            ]),
      ]);
      await expect(generated(pages, context)).rejects.toThrow(
        /Content changed/
      );
    }
  );

  it('propagates a failed preflight read rather than generating a fallback write', async () => {
    const pages = [page()];
    const { context, fetch } = mockContext(pages, false);
    const failure = new Error('Read failed');
    fetch.mockRejectedValue(failure);
    await expect(generated(pages, context)).rejects.toBe(failure);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('is a no-op on subsequent runs with a migrated draft snapshot', async () => {
    const pages = [
      page(),
      page({
        _id: 'drafts.page',
        commercialSections: [{ ...logoSection(), _type: newType }],
      }),
    ];
    const { context, fetch } = mockContext(pages, false);
    expect(await generated(pages, context)).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('validates every plan before yielding even the first transaction', async () => {
    const pages = [
      page(),
      page({
        _id: 'invalid',
        commercialSections: [logoSection(), logoSection()],
      }),
    ];
    const { context } = mockContext(pages, false);
    async function* documents() {
      yield* pages;
    }
    const changes = collectMigrationMutations(migration, documents, context);
    await expect(changes.next()).rejects.toThrow(/Ambiguous/);
  });

  it('rejects an unsafe copied array on a later page before yielding an earlier valid page', async () => {
    const pages = [
      page(),
      page({ _id: 'invalid', otherArray: [{ title: 'No key' }] }),
    ];
    const { context } = mockContext(pages);
    async function* documents() {
      yield* pages;
    }
    await expect(
      collectMigrationMutations(migration, documents, context).next()
    ).rejects.toThrow(/array item key/);
  });

  it('generates no published writes, replacements, deletions, or publish operations', async () => {
    const pages = [
      page(),
      page({
        _id: 'drafts.wedding',
        commercialSections: undefined,
        weddingSections: [logoSection()],
      }),
    ];
    const { context } = mockContext(pages, false);
    const changes = await generated(pages, context);
    expect(changes).toHaveLength(2);
    for (const change of changes) {
      for (const mutation of change.mutations) {
        if (mutation.type === 'create') {
          expect(mutation.document._id).toMatch(/^drafts\./);
          expect(mutation.document._type).toBe('page');
        } else if (mutation.type === 'patch') {
          expect(mutation.id).toMatch(/^drafts\./);
          for (const node of mutation.patches) {
            expect(node.path.at(-1)).toBe('_type');
            expect(node.path).toHaveLength(3);
            expect(node.op).toEqual({ type: 'set', value: newType });
          }
        } else {
          throw new Error(`Unexpected mutation: ${mutation.type}`);
        }
      }
    }
  });
});
