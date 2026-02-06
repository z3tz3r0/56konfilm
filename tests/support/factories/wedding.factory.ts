import { faker } from '@faker-js/faker';

export const createPackageItem = (overrides = {}) => ({
  _key: faker.string.uuid(),
  title: {
    en: faker.commerce.productName(),
    th: `แพ็กเกจ ${faker.commerce.productName()}`,
  },
  price: faker.number.int({ min: 1000, max: 20000 }),
  currency: 'THB',
  features: [
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence(),
  ],
  featured: false,
  ...overrides,
});

export const createTestimonialItem = (overrides = {}) => ({
  _key: faker.string.uuid(),
  quote: {
    en: faker.lorem.paragraph(),
    th: `คำนิยม: ${faker.lorem.paragraph()}`,
  },
  authorName: faker.person.fullName(),
  authorTitle: faker.person.jobTitle(),
  ...overrides,
});

export const createPackagesSection = (overrides = {}) => ({
  _type: 'packagesSection',
  _key: faker.string.uuid(),
  heading: {
    eyebrow: 'Our Packages',
    heading: 'CHOOSE YOUR STORY',
    body: 'Professional wedding film production services tailored to your emotional journey.',
  },
  packages: [
    createPackageItem({ title: { en: 'Cherish Starter', th: 'เริ่มต้น' }, price: 2000 }),
    createPackageItem({ title: { en: 'Forever Memories', th: 'ความทรงจำ' }, price: 5000, featured: true }),
    createPackageItem({ title: { en: 'Grand Symphony', th: 'อลังการ' }, price: 9000 }),
  ],
  ...overrides,
});

export const createTestimonialSection = (overrides = {}) => ({
  _type: 'testimonialSection',
  _key: faker.string.uuid(),
  heading: {
    eyebrow: 'Testimonials',
    heading: 'STORIES FROM THOSE WHO CHOSE US',
  },
  testimonials: Array.from({ length: 3 }, () => createTestimonialItem()),
  ...overrides,
});

export const createPhilosophySection = (overrides = {}) => ({
  _type: 'philosophySection',
  _key: faker.string.uuid(),
  quote: {
    en: 'We take our craft to heart as it\'s truly valuable in life',
    th: 'เราใส่หัวใจในงานของเรา เพราะมันคือสิ่งที่มีค่าในชีวิต',
  },
  ...overrides,
});
