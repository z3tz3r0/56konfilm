import { describe, expect, it, vi } from 'vitest';
import { mediaGallerySectionType } from '@/sanity/schemaTypes/sections/mediaGallerySection';
import { mediaBlockType } from '@/sanity/schemaTypes/objects/mediaBlock';

interface Context {
  document?: { siteMode?: string };
  parent?: { sectionVariant?: string };
}

interface SchemaField {
  name: string;
  type: string;
  initialValue?: string;
  options?: {
    showTooltip: boolean;
    optionSize: string;
    shape: string;
    list: Record<string, { name: string; icon: unknown; default?: boolean }>;
  };
  fields?: Array<{ name: string; type: string }>;
  hidden?: (context: Context) => boolean;
  validation?: (rule: unknown) => unknown;
}

const fields = mediaGallerySectionType.fields as unknown as SchemaField[];
const collageContext: Context = {
  document: { siteMode: 'wedding' },
  parent: { sectionVariant: 'collage' },
};
const inactiveContexts: Context[] = [
  { document: { siteMode: 'wedding' } },
  { document: { siteMode: 'wedding' }, parent: { sectionVariant: 'grid' } },
  {
    document: { siteMode: 'production' },
    parent: { sectionVariant: 'collage' },
  },
];

/**
 * Returns a Media Gallery schema field, throwing if the name is unknown.
 */
function getField(name: string) {
  const field = fields.find((item) => item.name === name);
  if (!field) throw new Error(`Missing schema field: ${name}`);
  return field;
}

/**
 * Captures and returns a field's custom validator using a mocked Sanity rule.
 */
function getValidator(name: string) {
  const rule = { custom: vi.fn().mockReturnThis() };
  getField(name).validation?.(rule);
  return rule.custom.mock.calls[0][0] as (
    value: unknown,
    context: Context
  ) => true | string;
}

/**
 * Creates valid asset-reference fixtures for all three collage image slots.
 */
function createImages() {
  return {
    smallPortrait: { image: { asset: { _ref: 'image-small' } } },
    landscape: { image: { asset: { _ref: 'image-landscape' } } },
    largePortrait: { image: { asset: { _ref: 'image-large' } } },
  };
}

describe('Media Gallery CMS variants', () => {
  it('offers visual options only for Wedding and defaults to Grid', () => {
    const field = getField('sectionVariant');
    expect(field.type).toBe('visualOptions');
    expect(field.initialValue).toBe('grid');
    expect(field.options).toMatchObject({
      showTooltip: true,
      optionSize: 'large',
      shape: 'box',
      list: {
        grid: { default: true, icon: expect.any(Function) },
        collage: { icon: expect.any(Function) },
      },
    });
    expect(field.hidden?.({ document: { siteMode: 'wedding' } })).toBe(false);
    expect(field.hidden?.({ document: { siteMode: 'production' } })).toBe(true);
    expect(field.hidden?.({})).toBe(true);
  });

  it('switches visible inputs without replacing the existing items field', () => {
    expect(getField('items').hidden?.(collageContext)).toBe(true);
    expect(getField('collageImages').hidden?.(collageContext)).toBe(false);
    for (const context of inactiveContexts) {
      expect(getField('items').hidden?.(context)).toBe(false);
      expect(getField('collageImages').hidden?.(context)).toBe(true);
    }
    expect(getField('collageImages').fields).toEqual([
      expect.objectContaining({
        name: 'smallPortrait',
        type: mediaBlockType.name,
      }),
      expect.objectContaining({ name: 'landscape', type: mediaBlockType.name }),
      expect.objectContaining({
        name: 'largePortrait',
        type: mediaBlockType.name,
      }),
    ]);
  });

  it('allows empty hidden items for Collage but requires media in every Grid', () => {
    const validate = getValidator('items');
    expect(validate(undefined, collageContext)).toBe(true);
    expect(validate([], collageContext)).toBe(true);
    for (const context of inactiveContexts) {
      expect(validate(undefined, context)).toBe(
        'Please add at least one media item'
      );
      expect(validate([], context)).toBe('Please add at least one media item');
      expect(
        validate([{ mediaType: 'image' }, { mediaType: 'video' }], context)
      ).toBe(true);
    }
  });

  it.each([
    undefined,
    {},
    { heading: [] },
    { heading: [{ value: '' }] },
    { heading: [{ value: ' \n ' }] },
    { heading: [{ value: 'Stories' }, { value: '' }] },
  ])('rejects missing or blank Collage headings: %j', (heading) => {
    const validate = getValidator('heading');
    expect(validate(heading, collageContext)).toEqual(expect.any(String));
    for (const context of inactiveContexts) {
      expect(validate(heading, context)).toBe(true);
    }
  });

  it('accepts a Collage heading without eyebrow or body', () => {
    expect(
      getValidator('heading')(
        { heading: [{ value: 'Love Stories' }] },
        collageContext
      )
    ).toBe(true);
  });

  it('requires uploaded assets rather than just empty media objects', () => {
    const validate = getValidator('collageImages');
    expect(validate(undefined, collageContext)).toEqual(expect.any(String));
    expect(validate({}, collageContext)).toEqual(expect.any(String));
    expect(validate(createImages(), collageContext)).toBe(true);
    for (const context of inactiveContexts) {
      expect(validate(undefined, context)).toBe(true);
      expect(validate({}, context)).toBe(true);
    }
  });

  it.each([
    ['smallPortrait', 'ภาพแนวตั้งขนาดเล็ก'],
    ['landscape', 'ภาพแนวนอนด้านล่าง'],
    ['largePortrait', 'ภาพขนาดใหญ่ด้านซ้าย'],
  ] as const)('blocks publishing when %s lacks an asset', (slot, label) => {
    const images = createImages();
    images[slot] = { image: { asset: { _ref: '  ' } } };
    expect(getValidator('collageImages')(images, collageContext)).toContain(
      label
    );
    const emptyImages = { ...createImages(), [slot]: {} };
    expect(
      getValidator('collageImages')(emptyImages, collageContext)
    ).toContain(label);
  });

  it('previews the active Collage images rather than the retained Grid items', () => {
    const preview = mediaGallerySectionType.preview?.prepare;
    expect(
      preview?.({
        title: 'Stories',
        sectionVariant: 'collage',
        collageImages: createImages(),
        items: Array.from({ length: 6 }, () => ({})),
        background: undefined,
      })
    ).toEqual({ title: 'Stories section', subtitle: 'Collage · 3 items' });
    expect(
      preview?.({
        title: undefined,
        sectionVariant: undefined,
        collageImages: undefined,
        items: [{}, {}],
        background: 'muted',
      })
    ).toEqual({
      title: 'Media Gallery Section',
      subtitle: 'muted · 2 items',
    });
  });
});
