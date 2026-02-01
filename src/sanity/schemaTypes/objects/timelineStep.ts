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
      description: 'ลำดับของขั้นตอน',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    }),
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'หัวข้อของขั้นตอน',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({ name: 'description', title: 'Description', description: 'คำอธิบายของขั้นตอน' }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      description: 'ไอคอน PNG ของขั้นตอน',
      options: { hotspot: true },
    }),
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

