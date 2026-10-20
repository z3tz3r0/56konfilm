import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MediaWithFallback from '@shared/components/common/MediaWithFallback';

describe('MediaWithFallback server output with real next/image', () => {
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
