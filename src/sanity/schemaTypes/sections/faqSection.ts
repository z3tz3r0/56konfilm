import { defineField, defineType, defineArrayMember } from 'sanity';
import { HelpCircleIcon } from '@sanity/icons';
import { localizedBlockType } from '../objects/localized';
import { faqItemType } from '../objects/faqItem';

export const faqSectionType = defineType({
  name: 'faqSection',
  title: 'FAQ Section',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วนคำถามที่พบบ่อย',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'items',
      title: 'FAQ Items',
      description: 'รายการคำถาม-คำตอบ',
      type: 'array',
      of: [defineArrayMember({ type: faqItemType.name })],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'background',
      title: 'Background',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Muted', value: 'muted' },
          { title: 'Contrast', value: 'contrast' },
        ],
        layout: 'radio',
      },
      initialValue: 'default',
    }),
  ],
  preview: {
    select: { title: 'heading.heading.0.value', items: 'items' },
    prepare({ title, items }) {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title: title || 'FAQ Section',
        subtitle: `${count} question${count === 1 ? '' : 's'}`,
      };
    },
  },
});
