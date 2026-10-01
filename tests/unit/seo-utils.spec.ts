import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '@shared/types';
import { buildMetadata } from '@shared/utils/seo/metadata';
import { buildProjectJsonLd } from '@shared/utils/seo/projectJsonLd';

const { urlFor, builder } = vi.hoisted(() => {
  const builder = {
    width: vi.fn().mockReturnThis(),
    height: vi.fn().mockReturnThis(),
    fit: vi.fn().mockReturnThis(),
    url: vi.fn(() => 'https://images.example.com/photo.jpg'),
  };
  return { builder, urlFor: vi.fn(() => builder) };
});

vi.mock('@/sanity/lib/image', () => ({ urlFor }));
vi.mock('@shared/config', () => ({
  env: { NEXT_PUBLIC_SITE_URL: 'https://site.example.com' },
}));

const image = {
  _type: 'image',
  asset: { _type: 'reference', _ref: 'image-test' },
};
const project: Project = {
  _id: 'project-id',
  title: 'Project title',
  slug: 'project',
  siteMode: ['production'],
  projectDate: '2050-01-02',
};

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  vi.useRealTimers();
});

describe('relocated metadata builder', () => {
  it('preserves home branding, language alternates, and default image', () => {
    const metadata = buildMetadata({
      lang: 'th',
      mode: 'wedding',
      pathname: '/th/wedding',
      siteTitle: 'Brand',
    });
    expect(metadata.metadataBase).toEqual(new URL('https://site.example.com'));
    expect(metadata.title).toEqual({
      default: 'Brand',
      template: '%s | Brand',
    });
    expect(metadata.description).toBe('Film Production House');
    expect(metadata.alternates).toEqual({
      canonical: '/th/wedding',
      languages: { en: '/en/wedding', th: '/th/wedding' },
    });
    expect(metadata.openGraph).toMatchObject({
      title: 'Brand',
      siteName: 'Brand',
      locale: 'th_TH',
      images: [
        {
          url: 'https://site.example.com/og-default.jpg',
          width: 1200,
          height: 630,
        },
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      images: ['https://site.example.com/og-default.jpg'],
    });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(urlFor).not.toHaveBeenCalled();
  });

  it('preserves primary and fallback SEO precedence for inner pages', () => {
    const metadata = buildMetadata({
      lang: 'en',
      mode: 'production',
      pathname: 'en/production/portfolio',
      title: 'Page title',
      seo: { title: 'SEO title' },
      fallbackSeo: {
        title: 'Fallback title',
        description: 'Fallback description',
        keywords: 'film',
      },
    });
    expect(metadata.title).toBe('SEO title');
    expect(metadata.description).toBe('Fallback description');
    expect(metadata.keywords).toBe('film');
    expect(metadata.alternates?.canonical).toBe('/en/production/portfolio');
    expect(metadata.openGraph).toMatchObject({ locale: 'en_US' });
  });

  it('preserves title defaults when no SEO values exist', () => {
    const base = {
      lang: 'en',
      mode: 'production',
      pathname: '/en/production/contact',
    } as const;
    expect(buildMetadata({ ...base, title: 'Contact' }).title).toBe('Contact');
    expect(
      buildMetadata({ ...base, fallbackTitle: 'Fallback brand' }).title
    ).toBe('Fallback brand');
    expect(buildMetadata(base).title).toBe('56KonFilm');
  });

  it('retains Sanity image-builder dimensions without contacting Sanity', () => {
    const metadata = buildMetadata({
      lang: 'en',
      mode: 'production',
      pathname: '/en/production/contact',
      fallbackSeo: { ogImage: image },
    });
    expect(urlFor).toHaveBeenCalledWith(image);
    expect(builder.width).toHaveBeenCalledWith(1200);
    expect(builder.height).toHaveBeenCalledWith(630);
    expect(builder.fit).toHaveBeenCalledWith('crop');
    expect(metadata.openGraph).toMatchObject({
      images: [
        {
          url: 'https://images.example.com/photo.jpg',
          width: 1200,
          height: 630,
        },
      ],
    });
  });
});

describe('relocated project JSON-LD builder', () => {
  it('keeps VideoObject data and the original project date', () => {
    expect(
      buildProjectJsonLd({
        project: {
          ...project,
          overview: 'Project overview',
          coverImage: image,
        },
        videoData: {
          name: 'Film name',
          url: 'https://videos.example.com/film',
        },
      })
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: 'Film name',
      description: 'Project overview',
      thumbnailUrl: ['https://images.example.com/photo.jpg'],
      uploadDate: '2050-01-02',
      contentUrl: 'https://videos.example.com/film',
    });
    expect(builder.width).toHaveBeenCalledWith(1280);
    expect(builder.height).toHaveBeenCalledWith(720);
    expect(builder.fit).toHaveBeenCalledWith('crop');
  });

  it('preserves title/date fallbacks and missing-image behavior', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-02-03T00:00:00.000Z'));
    const jsonLd = buildProjectJsonLd({
      project: { ...project, projectDate: '' },
      videoData: { name: 'Film name', url: 'https://videos.example.com/film' },
    });
    expect(jsonLd.description).toBe('Project title');
    expect(jsonLd.uploadDate).toBe('2050-02-03T00:00:00.000Z');
    expect(jsonLd.thumbnailUrl).toBeUndefined();
    expect(urlFor).not.toHaveBeenCalled();
  });
});
