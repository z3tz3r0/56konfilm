import { defineField, defineType } from 'sanity';

import { localizedStringField, localizedTextField } from './objects/localized';
import { socialMediaType } from './objects/socialMedia';

export const settingsType = defineType({
  name: 'settings',
  title: 'Global Settings',
  type: 'document',
  groups: [
    { name: 'branding', title: 'Branding', default: true },
    { name: 'navigation', title: 'Navigation' },
    { name: 'contact', title: 'Contact' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'favicon',
      title: 'Favicon',
      description:
        'ไอคอนเว็บไซต์ (Recommended: 32x32px or 512x512px .png/.ico)',
      type: 'image',
      group: 'branding',
      options: {
        accept: 'image/png, image/jpeg, image/x-icon, image/svg+xml',
      },
    }),
    localizedStringField({
      name: 'siteTitle',
      title: 'Brand Name',
      description: 'ชื่อแบรนด์หรือชื่อสตูดิโอ (ใช้ใน Navbar และเป็นค่าเริ่มต้นของ SEO)',
      group: 'branding',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'productionNav',
      title: 'Production Navigation',
      description: 'เมนูหลักสำหรับโหมด Production',
      type: 'array',
      group: 'navigation',
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
      group: 'navigation',
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
      description: 'ชื่อบริษัท (ใช้ใน Footer)',
      group: 'contact',
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({
      name: 'address',
      title: 'Address',
      description: 'ที่อยู่',
      group: 'contact',
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({
      name: 'contactTitle',
      title: 'Contact Title',
      description: 'หัวข้อการติดต่อ',
      group: 'contact',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({
      name: 'contacts',
      title: 'Contact Details',
      description: 'รายละเอียดการติดต่อ',
      group: 'contact',
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({
      name: 'socialMediaTitle',
      title: 'Social Media Title',
      description: 'หัวข้อโซเชียลมีเดีย',
      group: 'contact',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      description: 'ลิงก์โซเชียลมีเดีย',
      type: 'array',
      group: 'contact',
      of: [{ type: socialMediaType.name }],
    }),
    defineField({
      name: 'seo',
      title: 'Global SEO Default',
      description: 'ค่า SEO พื้นฐานของเว็บไซต์ (จะถูกใช้หากหน้าต่างๆ ไม่ได้ตั้งค่า SEO ไว้)',
      type: 'seo',
      group: 'seo',
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
