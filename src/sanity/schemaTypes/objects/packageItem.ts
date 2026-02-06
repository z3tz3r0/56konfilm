import { defineField, defineType } from 'sanity';
import { localizedStringField } from './localized';
import { ctaType } from './cta';

export const packageItemType = defineType({
  name: 'packageItem',
  title: 'Package Item',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'ชื่อแพ็กเกจ',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      description: 'ราคาแพ็กเกจ',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      description: 'สกุลเงิน',
      type: 'string',
      initialValue: 'THB',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'features',
      title: 'Features',
      description: 'รายการคุณสมบัติของแพ็กเกจ',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      description: 'ไฮไลต์แพ็กเกจนี้',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'cta',
      title: 'CTA',
      description: 'ปุ่ม CTA ของแพ็กเกจ',
      type: ctaType.name,
      validation: (Rule) => Rule.required(),
    }),
  ],
});
