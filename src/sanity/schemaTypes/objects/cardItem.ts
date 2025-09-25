import { defineField, defineType } from 'sanity';
import { localizedStringField, localizedTextField } from './localized';
import { ctaType } from './cta';

export const cardItemType = defineType({
  name: 'cardItem',
  title: 'Card Item',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'หัวข้อของการ์ด',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({ name: 'body', title: 'Body', description: 'เนื้อหาของการ์ด' }),
    defineField({
      name: 'icon',
      title: 'Icon',
      description: 'ไอคอนของการ์ด',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'variant',
      title: 'Variant',
      description: 'รูปแบบของการ์ด',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Highlighted', value: 'highlighted' },
        ],
      },
      initialValue: 'default',
    }),
    defineField({ name: 'cta', title: 'CTA', description: 'ปุ่ม CTA', type: ctaType.name }),
  ],
});

