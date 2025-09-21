import { defineField, defineType } from 'sanity';
import { localizedStringField } from './localized';

export const mediaBlockType = defineType({
  name: 'mediaBlock',
  title: 'Media',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({ name: 'alt', title: 'Alt Text' }),
  ],
});

