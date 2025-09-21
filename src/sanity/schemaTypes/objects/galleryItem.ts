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
      description: 'สื่อที่จะแสดงใน Gallery',
      type: mediaBlockType.name,
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({ name: 'label', title: 'Label', description: 'ข้อความที่แสดงบนสื่อ' }),
  ],
  preview: {
    select: { title: 'label.0.value', media: 'media.image' },
    prepare({ title, media }) {
      return { title: title || 'Gallery Item', media };
    },
  },
});

