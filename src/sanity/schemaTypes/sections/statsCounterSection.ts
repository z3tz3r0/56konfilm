import { defineField, defineType, defineArrayMember } from 'sanity';
import { BarChartIcon } from '@sanity/icons';
import { localizedBlockType } from '../objects/localized';
import { statItemType } from '../objects/statItem';

export const statsCounterSectionType = defineType({
  name: 'statsCounterSection',
  title: 'Stats Counter Section',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วนสถิติ (ไม่จำเป็น)',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      description: 'รายการตัวเลขสถิติ (แนะนำ 3-4 รายการ)',
      type: 'array',
      of: [defineArrayMember({ type: statItemType.name })],
      validation: (Rule) => Rule.min(2).max(6),
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
    select: { title: 'heading.heading.0.value', stats: 'stats' },
    prepare({ title, stats }) {
      const count = Array.isArray(stats) ? stats.length : 0;
      return {
        title: title || 'Stats Counter Section',
        subtitle: `${count} stat${count === 1 ? '' : 's'}`,
      };
    },
  },
});
