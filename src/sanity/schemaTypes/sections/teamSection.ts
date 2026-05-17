import { defineField, defineType, defineArrayMember } from 'sanity';
import { UsersIcon } from '@sanity/icons';
import { localizedBlockType } from '../objects/localized';
import { teamMemberType } from '../objects/teamMember';

export const teamSectionType = defineType({
  name: 'teamSection',
  title: 'Team Section',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วนทีมงาน',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'members',
      title: 'Team Members',
      description: 'รายชื่อสมาชิกทีม',
      type: 'array',
      of: [defineArrayMember({ type: teamMemberType.name })],
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
    select: { title: 'heading.heading.0.value', members: 'members' },
    prepare({ title, members }) {
      const count = Array.isArray(members) ? members.length : 0;
      return {
        title: title || 'Team Section',
        subtitle: `${count} member${count === 1 ? '' : 's'}`,
      };
    },
  },
});
