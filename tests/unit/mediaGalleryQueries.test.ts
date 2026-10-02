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
  const params = { lang, mode, slug: 'home', featuredProjectLimit: 3 };
  const query = parse(pageBySlugQuery, { params });
  const result = (await (
    await evaluate(query, { dataset: [page, ...extraDocuments], params })
  ).get()) as { contentBlocks: ProjectedSection[] };
  return result.contentBlocks[0];
}

describe('Media Gallery query integration', () => {
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
