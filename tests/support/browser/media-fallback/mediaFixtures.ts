import type { ImageSource } from '@shared/types/sanity';
import type { FixtureOptions } from './types';

/** Create synthetic CMS image data for a missing, invalid, or routable fixture asset. */
export function fixtureImage(state: FixtureOptions['state']) {
  return {
    asset:
      state === 'source-missing'
        ? null
        : {
            _ref:
              state === 'invalid'
                ? 'invalid-reference'
                : `image-${state}-1200x800-jpg`,
          },
    crop: null,
    hotspot: null,
  } satisfies ImageSource;
}
