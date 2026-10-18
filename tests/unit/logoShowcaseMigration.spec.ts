// @vitest-environment node
import { createRequire } from 'node:module';
import type { SanityDocument } from 'sanity';
import {
  collectMigrationMutations,
  type MigrationContext,
  type Transaction,
} from 'sanity/migrate';
import { describe, expect, it, vi } from 'vitest';
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
  const getDocuments = vi
    .fn()
    .mockImplementation(async ([publishedId, draftId]: string[]) => [
      pages.find((item) => item._id === publishedId) ?? null,
      pages.find((item) => item._id === draftId) ?? null,
    ]);
  const context: MigrationContext = {
    dryRun,
    client: { getDocuments } as unknown as MigrationContext['client'],
    filtered: {
      getDocument: vi.fn(async () => undefined),
      getDocuments: vi.fn(async () => []),
    },
  };
  return { context, getDocuments };
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
    const { context, getDocuments } = mockContext(pages);
    const result = await generated(pages, context);
    expect(result).toHaveLength(1);
    expect(result[0].mutations.map((mutation) => mutation.type)).toEqual([
      'create',
      'patch',
    ]);
    expect(getDocuments).not.toHaveBeenCalled();
    expect(pages).toEqual(originals);
  });

  it.each([true, false])(
    'uses a revision-guarded keyed patch for existing drafts (dryRun=%s)',
    async (dryRun) => {
      const draft = page({ _id: 'drafts.page', _rev: 'draft-revision' });
      const original = structuredClone(draft);
      const { context, getDocuments } = mockContext([page(), draft], dryRun);
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
      expect(getDocuments).not.toHaveBeenCalled();
      expect(draft).toEqual(original);
    }
  );

  it('strictly creates a draft copy and changes only section types in one transaction', async () => {
    const source = page();
    const original = structuredClone(source);
    const { context, getDocuments } = mockContext([source], false);
    const result = await generated([source], context);
    const {
      _rev: _rev,
      _createdAt: _createdAt,
      _updatedAt: _updatedAt,
      ...content
    } = original;
    expect(getDocuments).toHaveBeenCalledExactlyOnceWith([
      'page',
      'drafts.page',
    ]);
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
      const { context, getDocuments } = mockContext(pages, false);
      getDocuments.mockResolvedValue([
        change === 'deleted source'
          ? null
          : page({
              _rev:
                change === 'changed revision' ? 'new-revision' : 'revision-1',
            }),
        change === 'new draft' ? page({ _id: 'drafts.page' }) : null,
      ]);
      await expect(generated(pages, context)).rejects.toThrow(
        /Content changed/
      );
    }
  );

  it('propagates a failed preflight read rather than generating a fallback write', async () => {
    const pages = [page()];
    const { context, getDocuments } = mockContext(pages, false);
    const failure = new Error('Read failed');
    getDocuments.mockRejectedValue(failure);
    await expect(generated(pages, context)).rejects.toBe(failure);
    expect(getDocuments).toHaveBeenCalledOnce();
  });

  it('is a no-op on subsequent runs with a migrated draft snapshot', async () => {
    const pages = [
      page(),
      page({
        _id: 'drafts.page',
        commercialSections: [{ ...logoSection(), _type: newType }],
      }),
    ];
    const { context, getDocuments } = mockContext(pages, false);
    expect(await generated(pages, context)).toEqual([]);
    expect(getDocuments).not.toHaveBeenCalled();
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
