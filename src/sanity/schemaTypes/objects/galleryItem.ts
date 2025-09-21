import { defineField, defineType } from 'sanity';
import { localizedStringField } from './localized';
import { mediaBlockType } from './mediaBlock';

export const galleryItemType = defineType({
  name: 'galleryItem',
  title: 'Gallery Item',
  type: 'object',
  fields: [
    defineField({
      name: 'media',
      title: 'Media',
      type: mediaBlockType.name,
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({ name: 'label', title: 'Label' }),
  ],
  preview: {
    select: { title: 'label.0.value', media: 'media.image' },
    prepare({ title, media }) {
      return { title: title || 'Gallery Item', media };
    },
  },
});

