import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { pageBySlugQuery } from '@/sanity/lib/queries';
import type { Locale, SiteMode } from '@shared/config/preferences';

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

const localized = (en: string, th: string) => [
  { _key: 'random-en-key', language: 'en', value: en },
  { _key: 'random-th-key', language: 'th', value: th },
];

/** Evaluate the page query against an in-memory section for the locale and mode. */
async function resolveSection(
  section: Record<string, unknown>,
  lang: Locale = 'en',
  mode: SiteMode = 'production'
) {
  const params = { slug: 'home', lang, mode };
  const query = parse(pageBySlugQuery, { params });
  const result = (await (
    await evaluate(query, {
      params,
      dataset: [
        {
          _id: 'page',
          _type: 'page',
          siteMode: mode,
          slug: { current: 'home' },
          [mode === 'production' ? 'commercialSections' : 'weddingSections']: [
            { _key: 'showcase', _type: 'logoShowcaseSection', ...section },
          ],
        },
      ],
    })
  ).get()) as { contentBlocks: Record<string, unknown>[] };
  return result.contentBlocks[0];
}

describe('Logo Showcase page query', () => {
  for (const mode of ['production', 'wedding'] as const) {
    it.each(['en', 'th'] as const)(
      `projects localized ${mode} headings and sibling logo alt text in %s`,
      async (lang) => {
        const crop = { top: 0.1, bottom: 0, left: 0, right: 0.2 };
        const hotspot = { x: 0.5, y: 0.4, width: 0.8, height: 0.5 };
        const result = await resolveSection(
          {
            background: 'contrast',
            title: localized('Old title', 'หัวข้อเก่า'),
            heading: {
              eyebrow: localized('Clients', 'ลูกค้า'),
              heading: localized('Trusted brands', 'แบรนด์ที่ไว้วางใจเรา'),
              body: localized('Our customers', 'ลูกค้าของเรา'),
              align: 'end',
            },
            logos: [2, 0, 1].map((index) => ({
              _key: `logo-${index}`,
              image: {
                asset: { _ref: `image-${index}` },
                crop,
                hotspot,
                alt: localized('Incorrect nested alt', 'ไม่ใช่ alt ที่ต้องใช้'),
              },
              alt: localized(`Brand ${index}`, `แบรนด์ ${index}`),
            })),
          },
          lang,
          mode
        );
        expect(result).toEqual({
          _key: 'showcase',
          _type: 'logoShowcaseSection',
          background: 'contrast',
          heading: {
            eyebrow: lang === 'th' ? 'ลูกค้า' : 'Clients',
            heading: lang === 'th' ? 'แบรนด์ที่ไว้วางใจเรา' : 'Trusted brands',
            body: lang === 'th' ? 'ลูกค้าของเรา' : 'Our customers',
            align: 'end',
          },
          logos: [2, 0, 1].map((index) => ({
            _key: `logo-${index}`,
            image: { asset: { _ref: `image-${index}` }, crop, hotspot },
            alt: `${lang === 'th' ? 'แบรนด์' : 'Brand'} ${index}`,
          })),
        });
      }
    );
  }

  it.each(['en', 'th'] as const)(
    'falls back to the existing localized title with centered alignment (%s)',
    async (lang) => {
      expect(
        (
          await resolveSection(
            { title: localized('Legacy title', 'หัวข้อเดิม') },
            lang
          )
        ).heading
      ).toEqual({
        eyebrow: null,
        heading: lang === 'th' ? 'หัวข้อเดิม' : 'Legacy title',
        body: null,
        align: 'center',
      });
    }
  );

  it('supports historical keyed translations and language fallback', async () => {
    const result = await resolveSection(
      {
        heading: { heading: [{ _key: 'en', value: 'English fallback' }] },
        logos: [
          { _key: 'logo', alt: [{ _key: 'en', value: 'English brand' }] },
        ],
      },
      'th'
    );
    expect(result.heading).toMatchObject({
      heading: 'English fallback',
      align: 'center',
    });
    expect(result.logos).toEqual([
      { _key: 'logo', image: null, alt: 'English brand' },
    ]);
  });

  it('retains the legacy title when a draft heading contains only alignment', async () => {
    expect(
      (
        await resolveSection({
          heading: { align: 'start' },
          title: localized('Legacy', 'เดิม'),
        })
      ).heading
    ).toMatchObject({ heading: 'Legacy', align: 'start' });
  });

  it.each([0, 1, 6, 7, 13, 20, 21])(
    'does not truncate or reorder a saved collection of %i logos',
    async (count) => {
      const logos = Array.from({ length: count }, (_, index) => ({
        _key: `logo-${index}`,
        image: { asset: { _ref: `image-${index}` } },
      }));
      const result = await resolveSection({ logos });
      expect(result.logos).toHaveLength(count);
      expect(
        (result.logos as Array<{ _key: string }>).map((item) => item._key)
      ).toEqual(logos.map((item) => item._key));
    }
  );
});
