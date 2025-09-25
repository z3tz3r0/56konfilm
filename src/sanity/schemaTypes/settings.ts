import { defineField, defineType } from 'sanity';

import {
  localizedStringField,
  localizedTextField,
} from './objects/localized';
import { socialMediaType } from './objects/socialMedia';

export const settingsType = defineType({
  name: 'settings',
  title: 'Global Settings',
  type: 'document',
  fields: [
    localizedStringField({
      name: 'siteTitle',
      title: 'Site Title',
      description: 'ชื่อเว็บไซต์',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'productionNav',
      title: 'Production Navigation',
      description: 'เมนูหลักสำหรับโหมด Production',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [
        {
          type: 'object',
          fields: [
            localizedStringField({
              name: 'label',
              title: 'Label',
              description: 'ข้อความที่แสดงบนเมนู',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              description: 'ลิงก์เมนู',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'weddingNav',
      title: 'Wedding Navigation',
      description: 'เมนูหลักสำหรับโหมด Wedding',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [
        {
          type: 'object',
          fields: [
            localizedStringField({
              name: 'label',
              title: 'Label',
              description: 'ข้อความที่แสดงบนเมนู',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              description: 'ลิงก์เมนู',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
    localizedStringField({
      name: 'companyTitle',
      title: 'Company Title',
      description: 'ชื่อบริษัท',
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({
      name: 'address',
      title: 'Address',
      description: 'ที่อยู่',
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({
      name: 'contactTitle',
      title: 'Contact Title',
      description: 'หัวข้อการติดต่อ',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({
      name: 'contacts',
      title: 'Contact Details',
      description: 'รายละเอียดการติดต่อ',
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({
      name: 'socialMediaTitle',
      title: 'Social Media Title',
      description: 'หัวข้อโซเชียลมีเดีย',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      description: 'ลิงก์โซเชียลมีเดีย',
      type: 'array',
      of: [{ type: socialMediaType.name }],
    }),
  ],
  preview: {
    select: {
      title: 'siteTitle.0.value',
      subtitle: 'socialMediaTitle.0.value',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Global Settings',
        subtitle: subtitle || 'Navigation & Footer',
      };
    },
  },
});
