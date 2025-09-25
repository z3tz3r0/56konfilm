import { defineField, defineType } from 'sanity';

import { localizedStringField } from './localized';

export const socialMediaType = defineType({
  name: 'socialMedia',
  title: 'Social Media',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'label',
      title: 'Label',
      description: 'ชื่อแพลตฟอร์มโซเชียลมีเดีย',
      validation: (Rule) => Rule.required(),
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
