import { defineField, defineType } from 'sanity';
import { localizedStringField, localizedTextField } from './localized';

export const featureItemType = defineType({
  name: 'featureItem',
  title: 'Feature',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'ชื่อ Feature',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({
      name: 'description',
      title: 'Description',
      description: 'รายละเอียด Feature',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'รูปภาพประกอบ Feature',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      description: 'ชื่อ Lucide icon (เช่น Camera, Film, Heart, Star)',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title.0.value',
      icon: 'icon',
      media: 'image',
    },
    prepare({ title, icon, media }) {
      return {
        title: title || 'Feature',
        subtitle: icon ?? '',
        media,
      };
    },
  },
});
