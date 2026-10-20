import { describe, expect, it, vi } from 'vitest';
import type { ImageSource } from '@shared/types/sanity';

vi.mock('@shared/config', () => ({
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: 'fixture',
    NEXT_PUBLIC_SANITY_DATASET: 'development',
  },
}));

import { getImageSource, getImageUrl, urlFor } from '@/sanity/lib/image';

const id = 'image-aabbcc-1200x800-jpg';
describe('projected image source resolver (local builder only)', () => {
  it.each([
    undefined,
    null,
    { asset: null, crop: null, hotspot: null, alt: null },
    { asset: undefined, crop: null, hotspot: null, alt: null },
  ] satisfies Array<ImageSource | null | undefined>)(
    'keeps omitted projected source %j distinct from errors',
    (source) => {
      expect(getImageSource(source)).toBeUndefined();
    }
  );
  it.each([
    { asset: {}, crop: null, hotspot: null, alt: null },
    { asset: { _ref: '' }, crop: null, hotspot: null, alt: null },
    { asset: { _ref: 'malformed' }, crop: null, hotspot: null, alt: null },
  ] satisfies ImageSource[])(
    'keeps a present but invalid projected asset %j in the error state',
    (source) => {
      expect(getImageSource(source)).toEqual({ error: true });
    }
  );
  it('resolves the projected image without changing its localized alt', () => {
    const source = {
      asset: { _type: 'reference', _ref: id },
      crop: null,
      hotspot: null,
      alt: 'ภาพผลงาน',
    } satisfies ImageSource;
    const snapshot = structuredClone(source);
    expect(
      getImageSource(source, {
        width: 740,
        height: 555,
        quality: 85,
        fit: 'crop',
      })
    ).toBe(
      'https://cdn.sanity.io/images/fixture/development/aabbcc-1200x800.jpg?rect=67,0,1067,800&w=740&h=555&q=85&fit=crop'
    );
    expect(source).toEqual(snapshot);
  });
  it.each([
    id,
    { _ref: id },
    { _id: id },
    { asset: { _ref: id } },
    {
      asset: {
        url: 'https://cdn.sanity.io/images/fixture/development/aabbcc-1200x800.jpg',
      },
    },
  ] satisfies ImageSource[])(
    'preserves the existing URL helpers for supported image sources: %j',
    (source) => {
      expect(
        getImageUrl(source, {
          width: 740,
          height: 555,
          quality: 85,
          fit: 'crop',
        })
      ).toBe(
        'https://cdn.sanity.io/images/fixture/development/aabbcc-1200x800.jpg?rect=67,0,1067,800&w=740&h=555&q=85&fit=crop'
      );
      expect(
        urlFor(source).width(740).height(555).quality(85).fit('crop').url()
      ).toBe(
        getImageUrl(source, {
          width: 740,
          height: 555,
          quality: 85,
          fit: 'crop',
        })
      );
    }
  );
  it('preserves source data and the existing URL helpers', () => {
    const source = {
      asset: { _ref: id },
      hotspot: { x: 0.2, y: 0.5, width: 0.1, height: 0.1 },
      crop: { top: 0.1, bottom: 0.1, left: 0, right: 0 },
    };
    const snapshot = structuredClone(source);
    expect(getImageSource(source, { width: 600, height: 400 })).toBe(
      getImageUrl(source, { width: 600, height: 400 })
    );
    expect(source).toEqual(snapshot);
    expect(urlFor(source).width(600).height(400).url()).toBe(
      getImageSource(source, { width: 600, height: 400 })
    );
  });
});
