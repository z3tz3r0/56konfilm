import { defineField, defineType } from 'sanity';
import { localizedStringField } from './localized';

export const statItemType = defineType({
  name: 'statItem',
  title: 'Stat Item',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Value',
      description: 'ตัวเลขที่แสดง เช่น "200", "10", "50"',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'suffix',
      title: 'Suffix',
      description: 'ข้อความต่อท้ายตัวเลข เช่น "+", "%", "K"',
      type: 'string',
    }),
    localizedStringField({
      name: 'label',
      title: 'Label',
      description: 'คำอธิบายตัวเลข เช่น "Projects Completed"',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { value: 'value', suffix: 'suffix', label: 'label.0.value' },
    prepare({ value, suffix, label }) {
      return {
        title: `${value ?? ''}${suffix ?? ''}`,
        subtitle: label ?? 'Stat',
      };
    },
  },
});
