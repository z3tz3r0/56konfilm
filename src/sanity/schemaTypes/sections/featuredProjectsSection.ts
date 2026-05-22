import { defineField, defineType } from 'sanity';
import { ctaType } from '../objects/cta';
import { localizedBlockType } from '../objects/localized';

export const featuredProjectsSectionType = defineType({
  name: 'featuredProjectsSection',
  title: 'Featured Projects Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อของ Section (เช่น Our Previous Work)',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'sourceType',
      title: 'Content Source',
      description: 'เลือกรูปแบบการดึงข้อมูลผลงาน',
      type: 'string',
      options: {
        list: [
          {
            title: 'Auto (ระบบดึง 6 ผลงานล่าสุดอัตโนมัติ โดยเรียงตามวันเวลา)',
            value: 'latest',
          },
          {
            title: 'Curated (เลือกและจัดเรียงผลงานด้วยตัวเอง)',
            value: 'curated',
          },
        ],
        layout: 'radio',
      },
      initialValue: 'latest',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'selectedProjects',
      title: 'Selected Projects',
      description:
        'เลือกโปรเจกต์ที่ต้องการแสดง (ลากเพื่อจัดลำดับได้) สูงสุด 6 รายการ',
      type: 'array',
      // ✨ ซ่อนฟิลด์นี้ถ้า Editor เลือกดึงแบบ Auto
      hidden: ({ parent }) => parent?.sourceType !== 'curated',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }],
        },
      ],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { sourceType?: string } | undefined;
          const sourceType = parent?.sourceType;
          if (sourceType !== 'curated') return true;
          if (!value || value.length === 0)
            return 'Please select at least one project.';
          if (value.length > 6)
            return 'You can select a maximum of 6 projects.';
          return true;
        }),
    }),
    defineField({
      name: 'cta',
      title: 'CTA',
      description: 'ปุ่ม CTA (เช่น ไปยังหน้า Portfolio ทั้งหมด)',
      type: ctaType.name,
    }),
    defineField({
      name: 'background',
      title: 'Background',
      description: 'พื้นหลังของ Section',
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
      title: 'heading.heading.0.value',
      sourceType: 'sourceType',
      selectedProjects: 'selectedProjects',
    },
    prepare({ title, sourceType, selectedProjects }) {
      // คำนวณเพื่อแสดงจำนวนบน Preview ให้อ่านง่าย
      const count =
        sourceType === 'curated' && Array.isArray(selectedProjects)
          ? selectedProjects.length
          : 6;
      const sourceLabel = sourceType === 'latest' ? 'Auto (Latest)' : 'Curated';

      return {
        title: title ? `${title} section` : 'Featured Projects Section',
        subtitle: `${sourceLabel} · ${count} project${count === 1 ? '' : 's'}`,
      };
    },
  },
});
