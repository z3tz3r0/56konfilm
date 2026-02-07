/* eslint-disable react-hooks/rules-of-hooks */
// Note: The above is a false positive - Playwright's `use()` fixture function is not a React hook

import { test as base, expect } from '@playwright/test';
import {
    DeviceTierProfile,
    createHighTierProfile,
    createLowTierProfile,
} from '../factories/device-tier.factory';

type DeviceTierFixture = {
  lowTierProfile: DeviceTierProfile;
  highTierProfile: DeviceTierProfile;
  mockDeviceProfile: (profile: DeviceTierProfile) => Promise<void>;
};

export const test = base.extend<DeviceTierFixture>({
  lowTierProfile: async ({}, use) => {
    await use(createLowTierProfile());
  },

  highTierProfile: async ({}, use) => {
    await use(createHighTierProfile());
  },

  mockDeviceProfile: async ({ page }, use) => {
    await use(async (profile: DeviceTierProfile) => {
      await page.addInitScript((injectedProfile) => {
        const navigatorDescriptor = Object.getOwnPropertyDescriptor(
          window,
          'navigator'
        );

        const originalNavigator = navigatorDescriptor?.get
          ? navigatorDescriptor.get.call(window)
          : window.navigator;

        Object.defineProperty(window, 'navigator', {
          configurable: true,
          get: () => ({
            ...originalNavigator,
            hardwareConcurrency: injectedProfile.hardwareConcurrency,
            connection: {
              saveData: injectedProfile.saveData,
              effectiveType: injectedProfile.effectiveType,
            },
          }),
        });

        window.matchMedia = ((query: string) => {
          const reduceQuery = '(prefers-reduced-motion: reduce)';
          const matches =
            query === reduceQuery ? injectedProfile.reducedMotion : false;
          return {
            matches,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          };
        }) as typeof window.matchMedia;
      }, profile);
    });
  },
});

export { expect };
