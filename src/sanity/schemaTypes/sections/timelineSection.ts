import { defineField, defineType } from 'sanity';
import { localizedBlockType } from '../objects/localized';
import { timelineStepType } from '../objects/timelineStep';
import { ctaType } from '../objects/cta';

export const timelineSectionType = defineType({
  name: 'timelineSection',
  title: 'Timeline Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', description: 'หัวข้อของ Timeline', type: localizedBlockType.name }),
    defineField({
      name: 'steps',
      title: 'Steps',
      description: 'ขั้นตอนใน Timeline',
      type: 'array',
      of: [{ type: timelineStepType.name }],
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({ name: 'cta', title: 'CTA', description: 'ปุ่ม CTA', type: ctaType.name }),
    defineField({
      name: 'background',
      title: 'Background',
      description: 'พื้นหลังของ Timeline',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Muted', value: 'muted' },
          { title: 'Contrast', value: 'contrast' },
        ],
      },
      initialValue: 'default',
    }),
  ],
  preview: {
    select: {
      heading: 'heading.heading.0.value',
      steps: 'steps',
      background: 'background',
    },
    prepare({ heading, steps, background }) {
      const count = Array.isArray(steps) ? steps.length : 0;
      const subtitleParts = [background && background !== 'default' ? background : null, `${count} step${count === 1 ? '' : 's'}`];
      return {
        title: heading || 'Timeline Section',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
      };
    },
  },
});
