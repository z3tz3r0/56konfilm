import { Project } from '@/types/sanity';
import { faker } from '@faker-js/faker';

export const createProject = (overrides: Partial<Project> = {}): Project => ({
  _id: faker.string.uuid(),
  title: faker.commerce.productName(),
  overview: faker.lorem.paragraph(),
  siteMode: ['production'],
  slug: faker.helpers.slugify(faker.commerce.productName().toLowerCase()),
  coverImage: {
    asset: {
      _ref: `image-${faker.string.uuid()}-1920x1080-jpg`,
      _type: 'reference',
    },
  },
  client: faker.company.name(),
  services: [faker.word.noun(), faker.word.noun()],
  year: String(faker.date.past().getFullYear()),
  contentBlocks: [], // default empty, can override
  ...overrides,
});

export const createProjects = (count: number) => Array.from({ length: count }, () => createProject());
