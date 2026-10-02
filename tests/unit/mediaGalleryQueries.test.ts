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

interface ProjectedSection {
  sectionVariant: string;
  collageImages: Record<
    string,
    {
      image: { asset: { _ref: string }; crop: unknown; hotspot: unknown };
      alt: string;
    }
  > | null;
  items: Array<{
    _key: string;
    mediaType: string;
    media?: { image: { asset: { _ref: string } } };
    videoUrl?: string;
  }>;
}

/**
 * Evaluates the page query against a gallery fixture and optional documents,
 * returning the first projected section without calling Sanity.
 */
async function resolveSection(
  section: Record<string, unknown>,
  lang = 'en',
  mode = 'wedding',
  extraDocuments: unknown[] = []
) {
  const page = {
    _id: 'page',
    _type: 'page',
    slug: { current: 'home' },
    siteMode: mode,
    [mode === 'production' ? 'commercialSections' : 'weddingSections']: [
      { _key: 'gallery', _type: 'mediaGallerySection', ...section },
    ],
  };
  const params = { lang, mode, slug: 'home' };
  const query = parse(pageBySlugQuery, { params });
  const result = (await (
    await evaluate(query, { dataset: [page, ...extraDocuments], params })
  ).get()) as { contentBlocks: ProjectedSection[] };
  return result.contentBlocks[0];
}

describe('Media Gallery query integration', () => {
  for (const mode of ['production', 'wedding'] as const) {
    it.each(['en', 'th'] as const)(
      `resolves up to six legacy ${mode} projects in selection order with %s content`,
      async (lang) => {
        const crop = { top: 0.1, bottom: 0, left: 0.2, right: 0 };
        const hotspot = { x: 0.6, y: 0.4, width: 0.3, height: 0.4 };
        const projects = Array.from({ length: 8 }, (_, index) => ({
          _id: `project-${index}`,
          _type: 'project',
          slug: { current: `project-${index}` },
          coverImage: {
            asset: { _ref: `image-${index}` },
            crop,
            hotspot,
          },
          title: [
            { _key: 'en', value: `Project ${index}` },
            { _key: 'th', value: `ผลงาน ${index}` },
          ],
          overview: [
            { _key: 'en', value: `Overview ${index}` },
            { _key: 'th', value: `รายละเอียด ${index}` },
          ],
        }));
        const order = [7, 2, 5, 0, 6, 1, 4, 3];
        const result = await resolveSection(
          {
            sourceType: 'projects',
            selectedProjects: [
              { _ref: 'missing-first' },
              ...order
                .slice(0, 2)
                .map((index) => ({ _ref: `project-${index}` })),
              { _ref: 'missing-middle' },
              ...order.slice(2).map((index) => ({ _ref: `project-${index}` })),
            ],
          },
          lang,
          mode,
          projects
        );

        expect(result.sectionVariant).toBe('grid');
        expect(result.items).toEqual(
          order.slice(0, 6).map((index) => ({
            _key: `project-${index}`,
            mediaType: 'image',
            media: {
              image: { asset: { _ref: `image-${index}` }, crop, hotspot },
              alt: `${lang === 'th' ? 'ผลงาน' : 'Project'} ${index}`,
            },
            label: `${lang === 'th' ? 'ผลงาน' : 'Project'} ${index}`,
            projectSlug: `project-${index}`,
            projectOverview: `${lang === 'th' ? 'รายละเอียด' : 'Overview'} ${index}`,
          }))
        );
      }
    );

    it.each([
      { name: 'absent selection', selectedProjects: undefined },
      { name: 'null selection', selectedProjects: null },
      { name: 'empty selection', selectedProjects: [] },
      {
        name: 'unresolved references',
        selectedProjects: [{ _ref: 'missing' }],
      },
    ])(
      `returns an empty legacy ${mode} gallery for $name`,
      async ({ selectedProjects }) => {
        const result = await resolveSection(
          { sourceType: 'projects', selectedProjects },
          'en',
          mode
        );
        expect(result.items).toEqual([]);
      }
    );
  }

  it('keeps a short legacy selection without requiring a cover image', async () => {
    const result = await resolveSection(
      { sourceType: 'projects', selectedProjects: [{ _ref: 'no-cover' }] },
      'th',
      'wedding',
      [
        {
          _id: 'no-cover',
          _type: 'project',
          title: [{ _key: 'en', value: 'English fallback' }],
          slug: { current: 'no-cover' },
        },
      ]
    );
    expect(result.items).toEqual([
      {
        _key: 'no-cover',
        mediaType: 'image',
        media: { image: null, alt: 'English fallback' },
        label: 'English fallback',
        projectSlug: 'no-cover',
        projectOverview: null,
      },
    ]);
  });

  it.each(['production', 'wedding'])(
    'defaults legacy %s galleries to Grid and preserves image/video items',
    async (mode) => {
      const result = await resolveSection(
        {
          items: [
            {
              _key: 'photo',
              mediaType: 'image',
              media: { image: { asset: { _ref: 'image-grid' } } },
            },
            {
              _key: 'video',
              mediaType: 'video',
              videoFile: { asset: { _ref: 'video-file' } },
            },
          ],
        },
        'en',
        mode,
        [{ _id: 'video-file', url: 'https://example.com/video.mp4' }]
      );

      expect(result.sectionVariant).toBe('grid');
      expect(result.collageImages).toBeNull();
      expect(result.items).toMatchObject([
        {
          _key: 'photo',
          mediaType: 'image',
          media: { image: { asset: { _ref: 'image-grid' } } },
        },
        {
          _key: 'video',
          mediaType: 'video',
          videoUrl: 'https://example.com/video.mp4',
        },
      ]);
    }
  );

  it.each(['en', 'th'])(
    'projects all Collage slots with %s descriptions, crop, and hotspot',
    async (lang) => {
      const crop = { top: 0.1, bottom: 0, left: 0, right: 0.2 };
      const hotspot = { x: 0.6, y: 0.4, width: 0.3, height: 0.4 };
      const slots = ['smallPortrait', 'landscape', 'largePortrait'];
      const collageImages = Object.fromEntries(
        slots.map((slot) => [
          slot,
          {
            image: { asset: { _ref: `image-${slot}` }, crop, hotspot },
            alt: [
              { _key: 'en', value: `${slot} English` },
              { _key: 'th', value: `${slot} ภาษาไทย` },
            ],
          },
        ])
      );
      const result = await resolveSection(
        { sectionVariant: 'collage', collageImages },
        lang
      );

      expect(result.sectionVariant).toBe('collage');
      for (const slot of slots) {
        expect(result.collageImages?.[slot]).toEqual({
          image: { asset: { _ref: `image-${slot}` }, crop, hotspot },
          alt: `${slot} ${lang === 'th' ? 'ภาษาไทย' : 'English'}`,
        });
      }
    }
  );

  it('retains inactive Collage data and falls back to an available alt language', async () => {
    const result = await resolveSection(
      {
        sectionVariant: 'grid',
        collageImages: {
          landscape: {
            image: { asset: { _ref: 'image-landscape' } },
            alt: [{ _key: 'en', value: 'Wedding memories' }],
          },
        },
        items: [],
      },
      'th'
    );
    expect(result.sectionVariant).toBe('grid');
    expect(result.collageImages?.landscape.alt).toBe('Wedding memories');
    expect(result.collageImages?.landscape.image.asset._ref).toBe(
      'image-landscape'
    );
    expect(result.collageImages?.smallPortrait).toBeNull();
    expect(result.items).toEqual([]);
  });
});
