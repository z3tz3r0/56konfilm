import { defineType } from 'sanity';
import { HelpCircleIcon } from '@sanity/icons';
import { localizedStringField, localizedTextField } from './localized';

export const faqItemType = defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    localizedStringField({
      name: 'question',
      title: 'Question',
      description: 'คำถาม',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({
      name: 'answer',
      title: 'Answer',
      description: 'คำตอบ',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'question.0.value' },
    prepare({ title }) {
      return { title: title || 'Untitled FAQ', subtitle: 'FAQ' };
    },
  },
});
