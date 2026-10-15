import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { pageBySlugQuery } from '@/sanity/lib/queries';
import {
  GROUP_SERVICES_QUERY,
  PUBLISHED_PACKAGES_QUERY,
} from '@/sanity/lib/queries/packageCatalog';
import { orderedCatalogServices } from '@/sanity/lib/packageCatalog';

const requireFromSanity = createRequire(
  createRequire(import.meta.url).resolve('sanity')
);
const { parse, evaluate } = requireFromSanity('groq-js') as {
  parse: (
    query: string,
    options: { params: Record<string, unknown> }
  ) => unknown;
  evaluate: (
    query: unknown,
    options: { dataset: unknown[]; params: Record<string, unknown> }
  ) => Promise<{ get: () => Promise<unknown> }>;
};

/** Creates English and Thai entries in the Sanity localized text array format. */
const localized = (en: string, th = `ไทย ${en}`) => [
  { _key: 'en', language: 'en', value: en },
  { _key: 'th', language: 'th', value: th },
];
/** Creates a Sanity document reference for query or validation fixtures. */
const reference = (id: string) => ({ _type: 'reference', _ref: id });

/** Creates mode-specific packages and services with predictable membership for GROQ tests. */
function catalog(mode: string) {
  const services = Array.from({ length: 4 }, (_, index) => ({
    _id: `service-${index + 1}`,
    _type: 'packageService',
    siteMode: mode,
    title: localized(`Item ${index + 1}`),
    information: localized(`Details ${index + 1}`),
    _createdAt: `2026-01-0${index + 1}T00:00:00Z`,
    packages: ['first', 'second'].map(reference),
  }));
  const packages = ['first', 'second'].map((id, index) => ({
    _id: id,
    _type: 'package',
    siteMode: mode,
    title: localized(`Package ${id}`),
    price: index * 1000,
    currency: 'THB',
    badgeLabel: index === 0 ? localized('Popular') : undefined,
    cta: {
      label: localized('Discuss'),
      style: 'secondary',
      linkType: 'external',
      externalUrl: 'https://example.com/contact',
    },
  }));
  return { services, packages, documents: [...services, ...packages] };
}

interface ProjectedPackage {
  _id?: string;
  _key?: string;
  title: string;
  price: number;
  currency: string;
  featured?: boolean;
  features?: string[];
  serviceIds?: string[];
  badgeLabel?: string | null;
  cta: { label: string; style: string; linkType: string; externalUrl: string };
}
interface ProjectedBlock {
  packages?: ProjectedPackage[];
  heading?: { heading: string; body: string; eyebrow: string };
  groups?: Array<{
    _key: string;
    label: string;
    slug?: string | null;
    packages: ProjectedPackage[];
    rows: Array<{ _id: string; title: string; information: string | null }>;
  }>;
}

/** Evaluates the page query against a synthetic dataset and returns its projected content blocks. */
async function project(
  blocks: unknown[],
  documents: unknown[],
  mode = 'wedding',
  lang = 'en'
) {
  const params = { mode, lang, slug: 'packages' };
  const groupDocuments = blocks.flatMap(
    (block) => (block as { fixtureGroups?: unknown[] }).fixtureGroups ?? []
  );
  const pageBlocks = blocks.map((block) => {
    const { fixtureGroups: _fixtureGroups, ...content } = block as Record<
      string,
      unknown
    >;
    return content;
  });
  const page = {
    _id: 'page',
    _type: 'page',
    siteMode: mode,
    slug: { current: 'packages' },
    [mode === 'production' ? 'commercialSections' : 'weddingSections']:
      pageBlocks,
  };
  const result = await (
    await evaluate(parse(pageBySlugQuery, { params }), {
      params,
      dataset: [
        page,
        ...groupDocuments.map((item) => ({
          ...(item as object),
          siteMode: mode,
        })),
        ...documents,
      ],
    })
  ).get();
  return (result as { contentBlocks: ProjectedBlock[] }).contentBlocks;
}

/** Creates a catalog-backed packages section fixture with optional field overrides. */
const recap = (
  selectedPackages: unknown[],
  extra: Record<string, unknown> = {}
) => ({
  _type: 'packagesSection',
  sourceType: 'catalog',
  selectedPackages,
  ...extra,
});
/** Creates a comparison section fixture with references and synthetic group documents. */
const comparison = (groups: unknown[]) => ({
  _type: 'packageComparisonSection',
  heading: {
    heading: localized('Compare'),
    eyebrow: localized('Packages'),
    body: localized('Choose your package'),
  },
  groups: groups.map((item) => ({
    ...reference((item as { _id: string })._id),
    _key: (item as { _id: string })._id,
  })),
  fixtureGroups: groups,
});
/** Creates a package group fixture with the requested package and service ordering. */
const group = (key: string, packages: string[], rows: string[]) => ({
  _id: key,
  _type: 'packageGroup',
  _key: key,
  label: localized(key),
  packages: packages.map(reference),
  serviceOrder: rows.map(reference),
});

describe('Package catalog GROQ integration without external requests', () => {
  for (const mode of ['production', 'wedding']) {
    it.each(['en', 'th'])(
      `projects localized ${mode} groups, CTAs, and stable availability IDs in CMS order (%s)`,
      async (lang) => {
        const { documents } = catalog(mode);
        const [result] = await project(
          [
            comparison([
              group('budget', ['second', 'first'], ['service-3', 'service-1']),
              group('premium', ['first'], ['service-1', 'service-4']),
            ]),
          ],
          documents,
          mode,
          lang
        );
        const prefix = lang === 'th' ? 'ไทย ' : '';
        expect(result.heading?.heading).toBe(`${prefix}Compare`);
        expect(result.groups?.map((item) => item._key)).toEqual([
          'budget',
          'premium',
        ]);
        expect(result.groups?.[0].label).toBe(`${prefix}budget`);
        expect(result.groups?.[0].packages.map((item) => item._id)).toEqual([
          'second',
          'first',
        ]);
        expect(result.groups?.[0].rows.map((item) => item._id)).toEqual([
          'service-3',
          'service-1',
          'service-2',
          'service-4',
        ]);
        expect(result.groups?.[1].rows.map((item) => item._id)).toEqual([
          'service-1',
          'service-4',
          'service-2',
          'service-3',
        ]);
        expect(result.groups?.[0].rows[0]).toMatchObject({
          title: `${prefix}Item 3`,
          information: `${prefix}Details 3`,
        });
        expect(result.groups?.[0].packages[1]).toMatchObject({
          title: `${prefix}Package first`,
          price: 0,
          currency: 'THB',
          badgeLabel: `${prefix}Popular`,
          serviceIds: ['service-1', 'service-2', 'service-3', 'service-4'],
          cta: {
            label: `${prefix}Discuss`,
            style: 'secondary',
            linkType: 'external',
            externalUrl: 'https://example.com/contact',
          },
        });
      }
    );

    it(`preserves legacy inline ${mode} packages for missing and explicit sourceType`, async () => {
      for (const sourceType of [undefined, 'inline', 'manual']) {
        const [result] = await project(
          [
            {
              _type: 'packagesSection',
              sourceType,
              packages: [
                {
                  title: localized('Legacy'),
                  price: 500,
                  currency: 'THB',
                  features: ['Existing feature'],
                  featured: true,
                },
              ],
              selectedPackages: [{ packageRef: reference('first') }],
            },
          ],
          catalog(mode).documents,
          mode
        );
        expect(result.packages).toEqual([
          {
            title: 'Legacy',
            price: 500,
            currency: 'THB',
            features: ['Existing feature'],
            featured: true,
            cta: null,
          },
        ]);
      }
    });

    it(`uses the first three ${mode} services or an ordered editor-selected subset for recaps`, async () => {
      const { services, packages } = catalog(mode);
      const selection = [
        { _key: 'placement', packageRef: reference('first'), featured: true },
      ];
      const [automatic] = await project(
        [recap(selection)],
        [...services, ...packages],
        mode,
        'th'
      );
      expect(automatic.packages?.[0]).toMatchObject({
        _key: 'placement',
        featured: true,
        features: ['ไทย Item 1', 'ไทย Item 2', 'ไทย Item 3'],
      });
      const withHighlights = {
        ...packages[0],
        recapHighlights: [reference('service-4'), reference('service-2')],
      };
      const [selected] = await project(
        [recap(selection)],
        [...services, withHighlights],
        mode
      );
      expect(selected.packages?.[0].features).toEqual(['Item 4', 'Item 2']);
      const [short] = await project(
        [recap(selection)],
        [
          ...services.map((service) => ({
            ...service,
            packages: service._id === 'service-2' ? [reference('first')] : [],
          })),
          packages[0],
        ],
        mode
      );
      expect(short.packages?.[0].features).toEqual(['Item 2']);
    });

    it(`omits missing, unpublished, wrong-type, and cross-mode ${mode} references without changing ID associations`, async () => {
      const { services, packages } = catalog(mode);
      const wrongMode = mode === 'wedding' ? 'production' : 'wedding';
      const documents = [
        ...services,
        ...packages,
        { ...packages[0], _id: 'other-package', siteMode: wrongMode },
        { ...services[0], _id: 'other-service', siteMode: wrongMode },
        { ...packages[0], _id: 'drafts.unpublished' },
        { ...packages[0], _id: 'wrong-type', _type: 'project' },
      ];
      services.forEach((service) => {
        service.packages =
          service._id === 'service-2' ? [reference('first')] : [];
      });
      const [result] = await project(
        [
          comparison([
            group(
              'group',
              [
                'missing',
                'other-package',
                'unpublished',
                'wrong-type',
                'first',
              ],
              ['missing', 'other-service', 'wrong-type', 'service-2']
            ),
          ]),
        ],
        documents,
        mode
      );
      expect(result.groups?.[0].packages.map((item) => item._id)).toEqual([
        'first',
      ]);
      expect(result.groups?.[0].packages[0].serviceIds).toEqual(['service-2']);
      expect(result.groups?.[0].rows.map((item) => item._id)).toEqual([
        'service-2',
      ]);
      const [cards] = await project(
        [
          recap(
            [
              'missing',
              'other-package',
              'unpublished',
              'wrong-type',
              'first',
            ].map((id) => ({ packageRef: reference(id) }))
          ),
        ],
        documents,
        mode
      );
      expect(cards.packages?.map((item) => item.title)).toEqual([
        'Package first',
      ]);
    });
  }

  it('does not revive inline content when the catalog selection is empty', async () => {
    const [result] = await project(
      [recap([], { packages: [{ title: localized('Old') }] })],
      []
    );
    expect(result.packages).toEqual([]);
  });

  it('keeps editor highlights explicit and excludes items outside the package', async () => {
    const { services, packages } = catalog('wedding');
    const packageDocument = {
      ...packages[0],
      recapHighlights: [reference('service-4'), reference('missing')],
    };
    const [result] = await project(
      [recap([{ packageRef: reference('first') }])],
      [
        ...services.map((service) => ({
          ...service,
          packages: service._id === 'service-1' ? [reference('first')] : [],
        })),
        packageDocument,
      ]
    );
    expect(result.packages?.[0].features).toEqual([]);
  });

  it('reflects a shared edit in both recap and comparison while retaining English localization fallback', async () => {
    const { services, packages } = catalog('wedding');
    services[2].title = [
      { _key: 'en', language: 'en', value: 'Updated shared item' },
    ];
    const [cards, table] = await project(
      [
        recap([{ packageRef: reference('first') }]),
        comparison([group('shared', ['first'], ['service-3'])]),
      ],
      [...services, ...packages],
      'wedding',
      'th'
    );
    expect(cards.packages?.[0].features).toContain('Updated shared item');
    expect(table.groups?.[0].rows[0].title).toBe('Updated shared item');
  });

  it('does not truncate the number of groups or packages to three', async () => {
    const { services, packages } = catalog('wedding');
    const many = Array.from({ length: 5 }, (_, index) => ({
      ...packages[0],
      _id: `package-${index}`,
    }));
    const [result] = await project(
      [
        comparison(
          Array.from({ length: 4 }, (_, index) =>
            group(
              `group-${index}`,
              many.map((item) => item._id),
              ['service-1']
            )
          )
        ),
      ],
      [...services, ...many]
    );
    expect(result.groups).toHaveLength(4);
    expect(result.groups?.[0].packages).toHaveLength(5);
  });

  it('keeps published Group order while draft changes remain invisible', async () => {
    const published = {
      ...group('ordered', ['first'], ['service-3']),
      siteMode: 'wedding',
    };
    const draft = {
      ...published,
      _id: 'drafts.ordered',
      serviceOrder: [reference('service-2')],
    };
    const block = {
      _type: 'packageComparisonSection',
      groups: [{ ...reference('ordered'), _key: 'placement' }],
    };
    const [before] = await project(
      [block],
      [...catalog('wedding').documents, published, draft]
    );
    expect(before.groups?.[0]._key).toBe('placement');
    expect(before.groups?.[0].rows.map((item) => item._id)).toEqual([
      'service-3',
      'service-1',
      'service-2',
      'service-4',
    ]);
    const [after] = await project(
      [block],
      [
        ...catalog('wedding').documents,
        { ...published, serviceOrder: draft.serviceOrder },
      ]
    );
    expect(after.groups?.[0].rows.map((item) => item._id)).toEqual([
      'service-2',
      'service-1',
      'service-3',
      'service-4',
    ]);
  });

  it('appends newly published services without saving a Group and ignores obsolete ordering references', async () => {
    const { services, packages } = catalog('wedding');
    services[0].packages = [];
    const added = {
      ...services[0],
      _id: 'new',
      _createdAt: '2026-02-01T00:00:00Z',
      packages: [reference('first')],
    };
    const stored = {
      ...group('ordered', ['first'], ['service-1', 'missing', 'service-3']),
      siteMode: 'wedding',
    };
    const block = {
      _type: 'packageComparisonSection',
      groups: [{ ...reference('ordered'), _key: 'ordered' }],
    };
    const documents = [
      ...services,
      ...packages,
      stored,
      { ...added, _id: 'drafts.new' },
    ];
    const [before] = await project([block], documents);
    expect(before.groups?.[0].rows.map((item) => item._id)).toEqual([
      'service-3',
      'service-2',
      'service-4',
    ]);
    const [after] = await project([block], [...documents, added]);
    expect(after.groups?.[0].rows.map((item) => item._id)).toEqual([
      'service-3',
      'service-2',
      'service-4',
      'new',
    ]);
    const params = { mode: 'wedding', packageIds: ['first'] };
    const studio = (await (
      await evaluate(parse(GROUP_SERVICES_QUERY, { params }), {
        params,
        dataset: [...documents, added],
      })
    ).get()) as Array<{ _id: string; _createdAt: string }>;
    expect(
      orderedCatalogServices(studio, stored.serviceOrder).map(
        (item) => item._id
      )
    ).toEqual(after.groups?.[0].rows.map((item) => item._id));
    for (const row of after.groups?.[0].rows ?? [])
      expect(
        after.groups?.[0].packages.some((pkg) =>
          pkg.serviceIds?.includes(row._id)
        )
      ).toBe(true);
  });

  it('uses creation date and ID for new rows and recap, independently of Group order', async () => {
    const { services, packages } = catalog('wedding');
    const tied = services
      .map((item) => ({ ...item, _createdAt: '2026-01-01T00:00:00Z' }))
      .reverse();
    const [table, cards] = await project(
      [
        comparison([group('tie', ['first'], [])]),
        recap([{ packageRef: reference('first') }]),
      ],
      [...tied, ...packages]
    );
    expect(table.groups?.[0].rows.map((item) => item._id)).toEqual([
      'service-1',
      'service-2',
      'service-3',
      'service-4',
    ]);
    expect(cards.packages?.[0].features).toEqual([
      'Item 1',
      'Item 2',
      'Item 3',
    ]);
    expect(orderedCatalogServices(tied, []).map((item) => item._id)).toEqual([
      'service-1',
      'service-2',
      'service-3',
      'service-4',
    ]);
  });

  it('offers published Packages once and excludes release, draft-only and cross-mode membership', async () => {
    const { services, packages } = catalog('wedding');
    const documents = [
      ...services,
      ...packages,
      { ...packages[0], _id: 'drafts.first' },
      { ...packages[0], _id: 'drafts.only' },
      { ...packages[0], _id: 'versions.release.first' },
      { ...packages[0], _id: 'other', siteMode: 'production' },
      { ...services[0], _id: 'drafts.service' },
      { ...services[0], _id: 'versions.release.service' },
      { ...services[0], _id: 'cross', siteMode: 'production' },
      {
        ...services[0],
        _id: 'unavailable',
        packages: [reference('only'), reference('other')],
      },
    ];
    const params = { mode: 'wedding', packageIds: ['first', 'only', 'other'] };
    const choices = (await (
      await evaluate(parse(PUBLISHED_PACKAGES_QUERY, { params }), {
        params,
        dataset: documents,
      })
    ).get()) as Array<{ _id: string }>;
    expect(choices.map((item) => item._id).sort()).toEqual(['first', 'second']);
    const union = (await (
      await evaluate(parse(GROUP_SERVICES_QUERY, { params }), {
        params,
        dataset: documents,
      })
    ).get()) as Array<{ _id: string }>;
    expect(union.map((item) => item._id)).toEqual([
      'service-1',
      'service-2',
      'service-3',
      'service-4',
    ]);
    const [table] = await project(
      [
        comparison([
          group(
            'invalid',
            ['first', 'only', 'other', 'versions.release.first'],
            ['versions.release.service', 'cross', 'unavailable']
          ),
        ]),
      ],
      documents
    );
    expect(table.groups?.[0].packages.map((item) => item._id)).toEqual([
      'first',
    ]);
    expect(table.groups?.[0].rows.map((item) => item._id)).toEqual([
      'service-1',
      'service-2',
      'service-3',
      'service-4',
    ]);
  });

  it('filters invalid Group references and allows a published Package with no Services', async () => {
    const documents = [
      ...catalog('wedding').packages,
      { ...group('valid', ['first'], []), siteMode: 'wedding' },
      { ...group('other', ['first'], []), siteMode: 'production' },
      {
        ...group('draft', ['first'], []),
        _id: 'drafts.draft',
        siteMode: 'wedding',
      },
    ];
    const [result] = await project(
      [
        {
          _type: 'packageComparisonSection',
          groups: ['missing', 'other', 'draft', 'first', 'valid'].map((id) => ({
            ...reference(id),
            _key: id,
          })),
        },
      ],
      documents
    );
    expect(result.groups?.map((item) => item._key)).toEqual(['valid']);
    expect(result.groups?.[0].rows).toEqual([]);
    expect(result.groups?.[0].packages[0].serviceIds).toEqual([]);
  });

  it('derives distinct package cells and refreshes multiple Groups from a Service publish alone', async () => {
    const { services, packages } = catalog('wedding');
    services[0].packages = [reference('first')];
    services[1].packages = [reference('second')];
    services[2].packages = [];
    const blocks = [
      comparison([
        group('both', ['first', 'second'], ['service-3', 'service-2']),
        group('first-only', ['first'], ['service-1']),
      ]),
    ];
    const [before] = await project(blocks, [...services, ...packages]);
    expect(before.groups?.[0].rows.map((item) => item._id)).toEqual([
      'service-2',
      'service-1',
      'service-4',
    ]);
    expect(before.groups?.[0].packages.map((item) => item.serviceIds)).toEqual([
      ['service-1', 'service-4'],
      ['service-2', 'service-4'],
    ]);
    expect(before.groups?.[1].rows.map((item) => item._id)).toEqual([
      'service-1',
      'service-4',
    ]);
    services[0].packages = [reference('second')];
    const [after] = await project(blocks, [...services, ...packages]);
    expect(after.groups?.[0].packages.map((item) => item.serviceIds)).toEqual([
      ['service-4'],
      ['service-1', 'service-2', 'service-4'],
    ]);
    expect(after.groups?.[1].rows.map((item) => item._id)).toEqual([
      'service-4',
    ]);
  });

  it.each(['production', 'wedding'])(
    'projects published %s Group slugs without changing group identity or legacy visibility',
    async (mode) => {
      const published = {
        ...group('budget', ['first'], ['service-3']),
        siteMode: mode,
        slug: { _type: 'slug', current: 'budget-friendly' },
      };
      const draft = {
        ...published,
        _id: 'drafts.budget',
        slug: { _type: 'slug', current: 'new-budget' },
      };
      const legacy = { ...group('legacy', ['second'], []), siteMode: mode };
      const block = {
        _type: 'packageComparisonSection',
        groups: [
          { ...reference('budget'), _key: 'budget-placement' },
          { ...reference('legacy'), _key: 'legacy-placement' },
        ],
      };
      const documents = [
        ...catalog(mode).documents,
        published,
        draft,
        legacy,
        {
          ...published,
          _id: 'versions.release.budget',
          slug: { _type: 'slug', current: 'future-budget' },
        },
      ];
      for (const lang of ['th', 'en']) {
        const [before] = await project([block], documents, mode, lang);
        expect(
          before.groups?.map(({ _key, slug }) => ({ _key, slug }))
        ).toEqual([
          { _key: 'budget-placement', slug: 'budget-friendly' },
          { _key: 'legacy-placement', slug: null },
        ]);
        expect(before.groups?.[0].rows.map((row) => row._id)).toEqual([
          'service-3',
          'service-1',
          'service-2',
          'service-4',
        ]);
        expect(before.groups?.[0].packages[0].serviceIds).toEqual([
          'service-1',
          'service-2',
          'service-3',
          'service-4',
        ]);
      }
      const [after] = await project(
        [block],
        [
          ...catalog(mode).documents,
          { ...published, slug: draft.slug },
          draft,
          legacy,
        ],
        mode
      );
      expect(after.groups?.[0].slug).toBe('new-budget');
      expect(after.groups?.[0]._key).toBe('budget-placement');
    }
  );
});
