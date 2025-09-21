import { defineField, defineType } from 'sanity';
import { localizedStringField, localizedTextField } from './localized';

export const timelineStepType = defineType({
  name: 'timelineStep',
  title: 'Timeline Step',
  type: 'object',
  fields: [
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    }),
    localizedStringField({
      name: 'title',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({ name: 'description', title: 'Description' }),
  ],
  preview: {
    select: { title: 'title.0.value', order: 'order' },
    prepare({ title, order }) {
      return {
        title: title || 'Timeline Step',
        subtitle: order ? `Step ${order}` : undefined,
      };
    },
  },
});

