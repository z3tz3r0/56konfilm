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
      description: 'รูปภาพโลโก้',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({
      name: 'alt',
      title: 'Alt Text',
      description: 'ข้อความอธิบายรูปภาพ',
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

