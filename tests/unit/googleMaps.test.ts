import { describe, expect, it } from 'vitest';
import {
  extractGoogleMapsEmbedUrl,
  isGoogleMapsEmbedUrl,
} from '@shared/utils/googleMaps';

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

describe('Google Maps iframe extraction for Studio paste', () => {
  const url = 'https://www.google.com/maps/embed?pb=!1m18!1m12';

  it('extracts only the URL from Google Maps iframe markup', () => {
    expect(
      extractGoogleMapsEmbedUrl(
        `<iframe loading="lazy" width="600" src="${url}" height="450" style="border:0" allowfullscreen=""></iframe>`
      )
    ).toBe(url);
  });

  it('decodes HTML entities in the src attribute', () => {
    expect(
      extractGoogleMapsEmbedUrl(`<iframe src='${url}&amp;hl=th'></iframe>`)
    ).toBe(`${url}&hl=th`);
  });

  it('ignores other iframe attributes rather than persisting markup', () => {
    expect(
      extractGoogleMapsEmbedUrl(
        `<iframe onload="alert(1)" src="${url}" style="color:red"></iframe>`
      )
    ).toBe(url);
  });

  it('reads only a real src attribute, even when another attribute contains src text', () => {
    expect(
      extractGoogleMapsEmbedUrl(
        `<iframe data-note=" src='${url}' " src="https://example.com/maps/embed?pb=1"></iframe>`
      )
    ).toBeNull();
  });

  it('accepts whitespace and angle brackets inside a quoted non-src attribute', () => {
    expect(
      extractGoogleMapsEmbedUrl(
        `<iframe title="Map > office"\n src="${url}" allowfullscreen></iframe>`
      )
    ).toBe(url);
  });

  it.each([
    url,
    `<div><iframe src="${url}"></iframe></div>`,
    `<iframe src="${url}"></iframe><iframe src="${url}"></iframe>`,
    `<iframe src="${url}"></iframe><script>alert(1)</script>`,
    `<script>alert(1)</script><iframe src="${url}"></iframe>`,
    `<iframe src="${url}"><script>alert(1)</script></iframe>`,
    `<iframe src="${url}" src="${url}"></iframe>`,
    `<iframe src="${url}" onload="oops></iframe>`,
    '<iframe src="https://maps.app.goo.gl/example"></iframe>',
    '<iframe src="https://www.google.com.evil.example/maps/embed?pb=1"></iframe>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<iframe src="http://www.google.com/maps/embed?pb=1"></iframe>',
    '<iframe src="https://www.google.com/maps/embed"></iframe>',
    '<iframe srcdoc="<p>Map</p>"></iframe>',
    '<iframe></iframe>',
    '<p>Map</p>',
  ])('rejects non-embed or unsafe pasted content: %s', (markup) => {
    expect(extractGoogleMapsEmbedUrl(markup)).toBeNull();
  });
});
