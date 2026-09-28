import { defineField, defineType } from 'sanity';

import { localizedStringField } from './localized';

export const socialMediaType = defineType({
  name: 'socialMedia',
  title: 'Social Media',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'label',
      title: 'Social link name',
      description:
        'ใส่ชื่อช่องทาง เช่น Facebook หรือ Instagram หากไม่ได้เลือกไอคอน เว็บไซต์จะแสดงชื่อนี้แทน และใช้เป็นชื่อลิงก์ในส่วนท้ายเว็บไซต์ด้วย',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      description: 'เลือกไอคอนสำหรับ Social Link (ไม่จำเป็น)',
      type: 'icon',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      description: 'ลิงก์ไปยังโปรไฟล์โซเชียลมีเดีย',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'label.0.value',
      url: 'url',
    },
    prepare({ title, url }) {
      return {
        title: title || 'Social Media',
        subtitle: url,
      };
    },
  },
});
