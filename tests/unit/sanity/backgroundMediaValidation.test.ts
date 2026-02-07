import {
    IMAGE_SIZE_WARNING_MESSAGE,
    validateImageAssetSizeWarning,
} from '@/sanity/schemaTypes/objects/backgroundMedia';
import { describe, expect, it, vi } from 'vitest';

describe('backgroundMedia image validation', () => {
  it('returns true when there is no asset ref', async () => {
    const result = await validateImageAssetSizeWarning(undefined, {
      getClient: () => ({
        fetch: vi.fn(),
      }),
    });

    expect(result).toBe(true);
  });

  it('returns warning message when image asset exceeds 1MB', async () => {
    const result = await validateImageAssetSizeWarning(
      { asset: { _ref: 'image-large' } },
      {
        getClient: () => ({
          fetch: async () => ({ size: 1_500_000 }),
        }),
      }
    );

    expect(result).toBe(IMAGE_SIZE_WARNING_MESSAGE);
  });

  it('returns true when image asset is within limit', async () => {
    const result = await validateImageAssetSizeWarning(
      { asset: { _ref: 'image-small' } },
      {
        getClient: () => ({
          fetch: async () => ({ size: 500_000 }),
        }),
      }
    );

    expect(result).toBe(true);
  });

  it('returns true when image asset is exactly at 1MB limit (boundary)', async () => {
    const result = await validateImageAssetSizeWarning(
      { asset: { _ref: 'image-boundary' } },
      {
        getClient: () => ({
          fetch: async () => ({ size: 1_000_000 }),
        }),
      }
    );

    expect(result).toBe(true);
  });

  it('fails open when client fetch throws', async () => {
    const result = await validateImageAssetSizeWarning(
      { asset: { _ref: 'image-error' } },
      {
        getClient: () => ({
          fetch: async () => {
            throw new Error('network error');
          },
        }),
      }
    );

    expect(result).toBe(true);
  });
});
