import { defineField, defineType, defineArrayMember } from 'sanity';
import { ClipboardIcon } from '@sanity/icons';
import { localizedBlockType } from '../objects/localized';
import { processItemType } from '../objects/processItem';

export const processSectionType = defineType({
  name: 'processSection',
  title: 'Process Section',
  type: 'object',
  icon: ClipboardIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วน Process',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      description: 'ขั้นตอนการทำงาน (แนะนำ 3-5 ขั้นตอน)',
      type: 'array',
      of: [defineArrayMember({ type: processItemType.name })],
      validation: (Rule) => Rule.min(2).max(8),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      description: 'รูปแบบการแสดงผล',
      type: 'string',
      options: {
        list: [
          {
            title: 'Numbered (sticky header + scrollable steps)',
            value: 'numbered',
          },
          { title: 'Timeline (vertical connected steps)', value: 'timeline' },
        ],
        layout: 'radio',
      },
      initialValue: 'numbered',
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
    select: {
      title: 'heading.heading.0.value',
      steps: 'steps',
      layout: 'layout',
    },
    prepare({ title, steps, layout }) {
      const count = Array.isArray(steps) ? steps.length : 0;
      return {
        title: title || 'Process Section',
        subtitle: `${count} step${count === 1 ? '' : 's'} · ${layout ?? 'numbered'}`,
      };
    },
  },
});
