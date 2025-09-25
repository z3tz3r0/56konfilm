import { defineField, defineType } from 'sanity';
import { localizedStringField } from './localized';

export const ctaType = defineType({
  name: 'cta',
  title: 'CTA',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'label',
      title: 'Label',
      description: 'ข้อความที่แสดงบนปุ่ม CTA',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'style',
      title: 'Style',
      description: 'รูปแบบของปุ่ม CTA',
      type: 'string',
      options: {
        list: [
          { title: 'Primary', value: 'primary' },
          { title: 'Secondary', value: 'secondary' },
          { title: 'Link', value: 'link' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
    defineField({
      name: 'linkType',
      title: 'Link Type',
      description: 'ประเภทของลิงก์',
      type: 'string',
      options: {
        list: [
          { title: 'Internal', value: 'internal' },
          { title: 'External', value: 'external' },
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
    }),
    defineField({
      name: 'pageRef',
      title: 'Page',
      description: 'หน้าที่ต้องการลิงก์ไป',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      description: 'URL ภายนอกที่ต้องการลิงก์ไป',
      type: 'url',
      hidden: ({ parent }) => parent?.linkType !== 'external',
    }),
  ],
  validation: (Rule) =>
    Rule.custom((val) => {
      if (!val) return true;
      if (val.linkType === 'internal' && !val.pageRef) return 'Select a page';
      if (val.linkType === 'external' && !val.externalUrl) return 'Provide a URL';
      return true;
    }),
});

