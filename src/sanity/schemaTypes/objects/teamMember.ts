import { defineField, defineType } from 'sanity';
import { UserIcon } from '@sanity/icons';
import { localizedStringField, localizedTextField } from './localized';

export const teamMemberType = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'ชื่อสมาชิก',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({
      name: 'role',
      title: 'Role',
      description: 'ตำแหน่ง เช่น "Director of Photography"',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({
      name: 'bio',
      title: 'Bio',
      description: 'ประวัติย่อ (ไม่จำเป็น)',
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      description: 'รูปถ่ายสมาชิก (แนะนำอัตราส่วน 1:1)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role.0.value', media: 'image' },
  },
});
