import { defineField, defineType } from 'sanity';

import { localizedStringField, localizedTextField } from './localized';

export const seoObjectType = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'SEO title for search engines and social sharing',
    }),
    localizedTextField({
      name: 'description',
      title: 'Description',
      description: 'SEO description for search engines and social sharing',
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      description: 'Recommended size: 1200 x 630 px',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: 'title.0.value',
      subtitle: 'description.0.value',
      media: 'ogImage',
    },
  },
});
