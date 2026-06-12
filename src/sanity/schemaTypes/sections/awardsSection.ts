import { defineField, defineType, defineArrayMember } from 'sanity';
import { StarIcon } from '@sanity/icons';
import { localizedBlockType } from '../objects/localized';
import { awardItemType } from '../objects/awardItem';

export const awardsSectionType = defineType({
  name: 'awardsSection',
  title: 'Awards Section',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วน Awards',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'awards',
      title: 'Awards',
      description: 'รายการรางวัลและผลงาน',
      type: 'array',
      of: [defineArrayMember({ type: awardItemType.name })],
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
    select: {
      title: 'heading.heading.0.value',
      awards: 'awards',
    },
    prepare({ title, awards }) {
      const count = Array.isArray(awards) ? awards.length : 0;
      return {
        title: title || 'Awards Section',
        subtitle: `${count} award${count === 1 ? '' : 's'}`,
      };
    },
  },
});
