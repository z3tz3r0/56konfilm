import { defineField, defineType } from 'sanity';
import { localizedStringField } from '../objects/localized';

export const heroSectionType = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    localizedStringField({ name: 'title', title: 'Title' }),
    localizedStringField({ name: 'tagline', title: 'Title Line' }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'title.0.value',
      tagline: 'tagline.0.value',
      media: 'backgroundImage',
    },
    prepare({ title, tagline, media }) {
      return {
        title: title || 'Hero Section',
        subtitle: tagline || 'Hero Section',
        media,
      };
    },
  },
});
