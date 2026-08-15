import { defineField, defineType } from 'sanity';
import { UserIcon } from '@sanity/icons';
import { localizedStringField } from './localized';

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
    localizedStringField({
      name: 'bio',
      title: 'Tagline',
      description: `สโลแกนประจำตัวหรือประโยคสั้นๆ ที่สะท้อนตัวตน ทัศนคติ และความมุ่งมั่นในการทำงาน (ไม่เกิน 1 ประโยค) เช่น "Even a single millimeter of camera movement won't let you miss."`,
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
