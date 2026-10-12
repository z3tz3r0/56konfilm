import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { pageBySlugQuery } from '@/sanity/lib/queries';

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

const localized = (en: string, th = `ไทย ${en}`) => [
  { _key: 'en', language: 'en', value: en },
  { _key: 'th', language: 'th', value: th },
];
const reference = (id: string) => ({ _type: 'reference', _ref: id });

function catalog(mode: string) {
  const services = Array.from({ length: 4 }, (_, index) => ({
    _id: `service-${index + 1}`,
    _type: 'packageService',
    siteMode: mode,
    title: localized(`Item ${index + 1}`),
    information: localized(`Details ${index + 1}`),
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
    services: [3, 1, 2, 4].map((number) => reference(`service-${number}`)),
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
    packages: ProjectedPackage[];
    rows: Array<{ _id: string; title: string; information: string | null }>;
  }>;
}

async function project(
  blocks: unknown[],
  documents: unknown[],
  mode = 'wedding',
  lang = 'en'
) {
  const params = { mode, lang, slug: 'packages' };
  const page = {
    _id: 'page',
    _type: 'page',
    siteMode: mode,
    slug: { current: 'packages' },
    [mode === 'production' ? 'commercialSections' : 'weddingSections']: blocks,
  };
  const result = await (
    await evaluate(parse(pageBySlugQuery, { params }), {
      params,
      dataset: [page, ...documents],
    })
  ).get();
  return (result as { contentBlocks: ProjectedBlock[] }).contentBlocks;
}

const recap = (
  selectedPackages: unknown[],
  extra: Record<string, unknown> = {}
) => ({
  _type: 'packagesSection',
  sourceType: 'catalog',
  selectedPackages,
  ...extra,
});
const comparison = (groups: unknown[]) => ({
  _type: 'packageComparisonSection',
  heading: {
    heading: localized('Compare'),
    eyebrow: localized('Packages'),
    body: localized('Choose your package'),
  },
  groups,
});
const group = (key: string, packages: string[], rows: string[]) => ({
  _key: key,
  label: localized(key),
  packages: packages.map(reference),
  rows: rows.map(reference),
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
        ]);
        expect(result.groups?.[1].rows.map((item) => item._id)).toEqual([
          'service-1',
          'service-4',
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
          serviceIds: ['service-3', 'service-1', 'service-2', 'service-4'],
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
      for (const sourceType of [undefined, 'inline']) {
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
        features: ['ไทย Item 3', 'ไทย Item 1', 'ไทย Item 2'],
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
        [...services, { ...packages[0], services: [reference('service-2')] }],
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
      packages[0].services = [
        reference('missing'),
        reference('other-service'),
        reference('wrong-type'),
        reference('service-2'),
      ];
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
      services: [reference('service-1')],
      recapHighlights: [reference('service-4'), reference('missing')],
    };
    const [result] = await project(
      [recap([{ packageRef: reference('first') }])],
      [...services, packageDocument]
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
    expect(cards.packages?.[0].features?.[0]).toBe('Updated shared item');
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
});
