import { faker } from '@faker-js/faker';

export type DeviceTierProfile = {
  name: 'low' | 'medium' | 'high';
  hardwareConcurrency: number;
  saveData: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  reducedMotion: boolean;
  id: string;
};

export const createLowTierProfile = (
  overrides: Partial<DeviceTierProfile> = {}
): DeviceTierProfile => ({
  id: faker.string.uuid(),
  name: 'low',
  hardwareConcurrency: 2,
  saveData: true,
  effectiveType: '2g',
  reducedMotion: false,
  ...overrides,
});

export const createHighTierProfile = (
  overrides: Partial<DeviceTierProfile> = {}
): DeviceTierProfile => ({
  id: faker.string.uuid(),
  name: 'high',
  hardwareConcurrency: 8,
  saveData: false,
  effectiveType: '4g',
  reducedMotion: false,
  ...overrides,
});
