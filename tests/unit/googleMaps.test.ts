import { describe, expect, it } from 'vitest';
import { isGoogleMapsEmbedUrl } from '@shared/utils/googleMaps';

describe('Google Maps embed URL validation', () => {
  it.each([
    'https://www.google.com/maps/embed?pb=!1m18!1m12',
    'https://www.google.com/maps/embed?pb=!1m18!1m12&hl=th',
  ])('accepts a Share-menu embed URL: %s', (value) => {
    expect(isGoogleMapsEmbedUrl(value)).toBe(true);
  });

  it.each([
    '',
    'not a URL',
    '<iframe src="https://www.google.com/maps/embed?pb=!1m18"></iframe>',
    'http://www.google.com/maps/embed?pb=!1m18',
    '//www.google.com/maps/embed?pb=!1m18',
    'javascript:alert(1)',
    'https://maps.app.goo.gl/example',
    'https://www.google.com/maps/place/example',
    'https://www.google.com/maps/embed/v1/place?key=example&q=example',
    'https://www.google.com/maps/embed',
    'https://www.google.com/maps/embed?pb=',
    'https://www.google.com/maps/embed?pb=%20',
    'https://example.com/maps/embed?pb=!1m18',
    'https://www.google.com.example.com/maps/embed?pb=!1m18',
    'https://www.google.com@evil.example/maps/embed?pb=!1m18',
    'https://user:password@www.google.com/maps/embed?pb=!1m18',
    'https://www.google.com:444/maps/embed?pb=!1m18',
  ])('rejects an unsupported URL or raw HTML: %s', (value) => {
    expect(isGoogleMapsEmbedUrl(value)).toBe(false);
  });
});
