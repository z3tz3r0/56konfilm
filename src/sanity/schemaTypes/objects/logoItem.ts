import { defineField, defineType } from 'sanity';
import { localizedStringField } from './localized';

export const logoItemType = defineType({
  name: 'logoItem',
  title: 'Logo Item',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({
      name: 'alt',
      title: 'Alt Text',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'alt.0.value', media: 'image' },
    prepare({ title, media }) {
      return { title: title || 'Logo', media };
    },
  },
});

