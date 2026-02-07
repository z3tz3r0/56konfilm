import { faker } from '@faker-js/faker';

// Mocking the SEO structure planned for Story 4.1
export interface SeoData {
  title?: string;
  description?: string;
  ogImage?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
}

export const createSeoData = (overrides: Partial<SeoData> = {}): SeoData => ({
  title: faker.commerce.productName() + ' | SEO Perfect',
  description: faker.lorem.sentence(),
  ogImage: {
    asset: {
      _ref: `image-${faker.string.uuid()}-1200x630-jpg`,
      _type: 'reference',
    },
  },
  ...overrides,
});
