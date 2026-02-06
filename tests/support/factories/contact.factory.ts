import { faker } from '@faker-js/faker';

export interface ContactSubmission {
  name: string;
  email: string;
  phone: string;
  message: string;
  type: 'commercial' | 'wedding';
  weddingDate?: string;
  venue?: string;
}

export const createContactSubmission = (overrides: Partial<ContactSubmission> = {}): ContactSubmission => {
  const type = overrides.type || faker.helpers.arrayElement(['commercial', 'wedding']);
  
  const base = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    message: faker.lorem.paragraph(),
    type,
    ...overrides,
  };

  if (type === 'wedding') {
    return {
      ...base,
      weddingDate: faker.date.future().toISOString().split('T')[0],
      venue: faker.location.streetAddress(),
    };
  }

  return base;
};

export const createContactSubmissions = (count: number, overrides: Partial<ContactSubmission> = {}) => 
  Array.from({ length: count }, () => createContactSubmission(overrides));
