import { defineField, defineType } from 'sanity';
import { localizedStringField } from '../objects/localized';

export const heroSectionType = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    localizedStringField({ name: 'title', title: 'Title', description: 'หัวข้อของ Hero Section' }),
    localizedStringField({ name: 'tagline', title: 'Tagline', description: 'คำโปรยของ Hero Section' }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      description: 'รูปภาพพื้นหลังของ Hero Section',
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
