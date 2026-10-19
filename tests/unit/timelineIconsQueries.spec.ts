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
  { _key: 'translation-en', language: 'en', value: en },
  { _key: 'translation-th', language: 'th', value: th },
];
const legacyImage = {
  asset: { _type: 'reference', _ref: `image-${'a'.repeat(40)}-48x48-png` },
  crop: { top: 0.1, bottom: 0, left: 0, right: 0.1 },
  hotspot: { x: 0.5, y: 0.4, height: 0.8, width: 0.8 },
};

/** Evaluate the real page query against an offline fixture, never Content Lake. */
async function resolveSection(
  section: Record<string, unknown>,
  mode: SiteMode = 'production',
  lang: Locale = 'en'
) {
  const params = { slug: 'home', mode, lang };
  const dataset = [
    {
      _id: 'fixture-page',
      _type: 'page',
      siteMode: mode,
      slug: { current: 'home' },
      [mode === 'production' ? 'commercialSections' : 'weddingSections']: [
        { _key: 'timeline', _type: 'timelineSection', ...section },
      ],
    },
  ];
  const before = structuredClone(dataset);
  const result = (await (
    await evaluate(parse(pageBySlugQuery, { params }), { dataset, params })
  ).get()) as {
    contentBlocks: Array<Record<string, unknown>>;
  };
  expect(dataset).toEqual(before);
  return result.contentBlocks[0];
}

describe('Timeline icon page projection', () => {
  for (const mode of ['production', 'wedding'] as const) {
    it.each(['en', 'th'] as const)(
      `projects ${mode} icons while preserving localization, order, images, heading, and CTA (%s)`,
      async (lang) => {
        const result = await resolveSection(
          {
            hasIcon: true,
            background: 'muted',
            heading: {
              eyebrow: localized('Process', 'ขั้นตอน'),
              heading: localized('How we work', 'วิธีทำงานของเรา'),
              body: localized('Our workflow', 'กระบวนการทำงาน'),
              align: 'center',
            },
            steps: [3, 1, 2].map((order) => ({
              _key: `step-${order}`,
              order,
              title: localized(`Step ${order}`, `ขั้นตอน ${order}`),
              description: localized(
                `Description ${order}`,
                `รายละเอียด ${order}`
              ),
              icon: { _type: 'image', ...legacyImage },
              iconPicker: { _type: 'icon', name: `mdi:camera-${order}` },
            })),
            cta: {
              label: localized('Contact us', 'ติดต่อเรา'),
              style: 'secondary',
              linkType: 'external',
              externalUrl: 'https://example.com/contact',
            },
          },
          mode,
          lang
        );
        expect(result).toEqual({
          _key: 'timeline',
          _type: 'timelineSection',
          hasIcon: true,
          background: 'muted',
          heading: {
            eyebrow: lang === 'th' ? 'ขั้นตอน' : 'Process',
            heading: lang === 'th' ? 'วิธีทำงานของเรา' : 'How we work',
            body: lang === 'th' ? 'กระบวนการทำงาน' : 'Our workflow',
            align: 'center',
          },
          steps: [1, 2, 3].map((order) => ({
            order,
            title: `${lang === 'th' ? 'ขั้นตอน' : 'Step'} ${order}`,
            description: `${lang === 'th' ? 'รายละเอียด' : 'Description'} ${order}`,
            icon: legacyImage,
            iconPicker: { name: `mdi:camera-${order}` },
          })),
          cta: {
            label: lang === 'th' ? 'ติดต่อเรา' : 'Contact us',
            style: 'secondary',
            linkType: 'external',
            pageRef: null,
            externalUrl: 'https://example.com/contact',
          },
        });
      }
    );
    it.each([false, undefined, null])(
      `defaults ${mode} icon visibility to off for %s without clearing selections or images`,
      async (hasIcon) => {
        const result = await resolveSection(
          {
            ...(hasIcon === undefined ? {} : { hasIcon }),
            steps: [
              {
                order: 1,
                icon: legacyImage,
                iconPicker: { name: 'mdi:camera' },
              },
            ],
          },
          mode
        );
        expect(result.hasIcon).toBe(false);
        expect(result.steps).toMatchObject([
          {
            order: 1,
            icon: legacyImage,
            iconPicker: { name: 'mdi:camera' },
          },
        ]);
      }
    );
    it(`preserves legacy ${mode} image data without inventing a picker selection`, async () => {
      const result = await resolveSection(
        { steps: [{ order: 1, icon: legacyImage }] },
        mode
      );
      expect(result.hasIcon).toBe(false);
      expect(result.steps).toMatchObject([
        { order: 1, icon: legacyImage, iconPicker: null },
      ]);
    });
    it(`supports missing and empty ${mode} step lists`, async () => {
      expect((await resolveSection({}, mode)).steps).toBeNull();
      expect((await resolveSection({ steps: [] }, mode)).steps).toEqual([]);
    });
    it(`does not suppress a valid ${mode} picker when the legacy image is absent`, async () => {
      const result = await resolveSection(
        {
          hasIcon: true,
          steps: [{ order: 1, iconPicker: { name: 'mdi:camera' } }],
        },
        mode
      );
      expect(result.steps).toMatchObject([
        { order: 1, icon: null, iconPicker: { name: 'mdi:camera' } },
      ]);
    });
    it(`leaves the original ${mode} Process projection unchanged`, async () => {
      const result = await resolveSection(
        {
          _key: 'process',
          _type: 'processSection',
          layout: 'numbered',
          background: 'contrast',
          hasIcon: true,
          steps: [2, 1].map((stepNumber) => ({
            _key: `step-${stepNumber}`,
            stepNumber,
            title: localized(`Step ${stepNumber}`, `ขั้นตอน ${stepNumber}`),
            description: localized('Description', 'รายละเอียด'),
            icon: 'Camera',
            iconPicker: { name: 'mdi:camera' },
          })),
        },
        mode
      );
      expect(result).toEqual({
        _key: 'process',
        _type: 'processSection',
        layout: 'numbered',
        background: 'contrast',
        heading: null,
        steps: [1, 2].map((stepNumber) => ({
          _key: `step-${stepNumber}`,
          stepNumber,
          title: `Step ${stepNumber}`,
          description: 'Description',
          icon: 'Camera',
        })),
      });
    });
  }
});
