import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import MediaWithFallback from '@shared/components/common/MediaWithFallback';
import ProjectHero from '@shared/components/layout/project-detail/ProjectHero';

vi.mock('@shared/config/env', () => ({
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: 'fixture',
    NEXT_PUBLIC_SANITY_DATASET: 'development',
  },
}));

describe('MediaWithFallback server output with real next/image', () => {
  it('keeps the optimized Project Hero priority image available before hydration', () => {
    const html = renderToStaticMarkup(
      <ProjectHero
        lang='th'
        projectTitle='Project cover'
        coverImage={{ asset: { _ref: 'image-cover-1200x800-jpg' } }}
      />
    );
    expect(html).toContain('alt="Project cover"');
    expect(html).toContain('srcSet=');
    expect(html).toContain('rel="preload"');
    expect(html).not.toContain('loading="lazy"');
    expect(html).not.toMatch(/opacity-0|visibility:hidden|display:none/);
  });

  it('preserves the native next/image blur placeholder option', () => {
    const html = renderToStaticMarkup(
      <MediaWithFallback
        mediaType='image'
        source='/fixture.jpg'
        lang='en'
        alt='Blurred cover'
        width={400}
        height={250}
        placeholder='blur'
        blurDataURL='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
      />
    );
    expect(html).toContain('<img');
    expect(html).toContain('alt="Blurred cover"');
    expect(html).toContain('background-image:');
    expect(html).toContain('data-media-status="loading"');
  });

  it('renders the actual optimized image before hydration instead of hiding it until onLoad', () => {
    const html = renderToStaticMarkup(
      <MediaWithFallback
        mediaType='image'
        source='/fixture.jpg'
        lang='en'
        alt='Server cover'
        fill
        sizes='50vw'
        priority
      />
    );
    expect(html).toContain('<img');
    expect(html).toContain('alt="Server cover"');
    expect(html).toContain('srcSet=');
    expect(html).toContain('sizes="50vw"');
    expect(html).toContain('data-media-status="loading"');
    expect(html).not.toMatch(/opacity-0|visibility:hidden|display:none/);
  });
});
