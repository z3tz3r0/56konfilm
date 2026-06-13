import { defineField, defineType } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons';
import { localizedBlockType } from '../objects/localized';
import { ctaType } from '../objects/cta';

export const blogPreviewSectionType = defineType({
  name: 'blogPreviewSection',
  title: 'Blog Preview Section',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วน Blog (เช่น "Stories", "Behind the Scenes")',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'maxPosts',
      title: 'Max Posts',
      description: 'จำนวนโพสต์ที่แสดง (แนะนำ 3)',
      type: 'number',
      initialValue: 3,
      validation: (Rule) => Rule.required().min(1).max(9),
    }),
    defineField({
      name: 'cta',
      title: 'CTA Button',
      description: 'ปุ่ม "ดูทั้งหมด" ด้านล่าง (ไม่จำเป็น)',
      type: ctaType.name,
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
      initialValue: 'muted',
    }),
  ],
  preview: {
    select: {
      title: 'heading.heading.0.value',
      maxPosts: 'maxPosts',
    },
    prepare({ title, maxPosts }) {
      return {
        title: title || 'Blog Preview Section',
        subtitle: `Latest ${maxPosts ?? 3} posts`,
      };
    },
  },
});
