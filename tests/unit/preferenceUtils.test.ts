import { describe, expect, it } from 'vitest';
import { isSupportedLocale, isSupportedMode } from '@shared/utils';

describe('isSupportedLocale', () => {
  it('accepts "th"', () => {
    expect(isSupportedLocale('th')).toBe(true);
  });

  it('accepts "en"', () => {
    expect(isSupportedLocale('en')).toBe(true);
  });

  it('rejects unsupported locales', () => {
    expect(isSupportedLocale('fr')).toBe(false);
    expect(isSupportedLocale('')).toBe(false);
    expect(isSupportedLocale('TH')).toBe(false);
  });
});

describe('isSupportedMode', () => {
  it('accepts "production"', () => {
    expect(isSupportedMode('production')).toBe(true);
  });

  it('accepts "wedding"', () => {
    expect(isSupportedMode('wedding')).toBe(true);
  });

  it('rejects unsupported modes', () => {
    expect(isSupportedMode('unknown')).toBe(false);
    expect(isSupportedMode('')).toBe(false);
  });
});
