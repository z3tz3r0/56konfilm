import { defineField, defineType } from 'sanity';
import {
  FEATURED_PROJECT_LIMITS,
  type SiteMode,
} from '@shared/config/preferences';
import { ctaType } from '../objects/cta';
import { localizedBlockType } from '../objects/localized';

function validateProjectSelection(
  value: unknown,
  sourceType: unknown,
  siteMode: unknown,
  fieldMode: SiteMode
) {
  if (siteMode !== fieldMode || sourceType !== 'curated') return true;
  if (!Array.isArray(value) || value.length === 0)
    return 'Please select at least one project.';
  if (value.length > FEATURED_PROJECT_LIMITS[fieldMode])
    return `You can select a maximum of ${FEATURED_PROJECT_LIMITS[fieldMode]} projects.`;

  const refs = value
    .map((item) => (item as { _ref?: string })._ref)
    .filter(Boolean);
  if (new Set(refs).size !== refs.length)
    return 'Duplicate projects are not allowed. Please remove duplicates.';

  return true;
}

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
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value || typeof value !== 'object') return true;
          const headings = (value as { heading?: Array<{ value?: string }> })
            .heading;
          return Array.isArray(headings) &&
            headings.length > 0 &&
            headings.every(
              (item) => typeof item.value === 'string' && item.value.trim()
            )
            ? true
            : 'Please enter the main heading.';
        }),
    }),
    defineField({
      name: 'sourceType',
      title: 'Content Source',
      description: 'เลือกรูปแบบการดึงข้อมูลผลงาน',
      type: 'string',
      options: {
        list: [
          {
            title: 'Auto (ระบบดึงผลงานล่าสุดอัตโนมัติ โดยเรียงตามวันเวลา)',
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
      description: `เลือกผลงานที่ต้องการแสดงได้สูงสุด ${FEATURED_PROJECT_LIMITS.production} รายการ และลากเพื่อจัดลำดับ`,
      type: 'array',
      hidden: ({ document, parent }) =>
        document?.siteMode !== 'production' || parent?.sourceType !== 'curated',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }],
        },
      ],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { sourceType?: string } | undefined;
          return validateProjectSelection(
            value,
            parent?.sourceType,
            context.document?.siteMode,
            'production'
          );
        }),
    }),
    defineField({
      name: 'weddingSelectedProjects',
      title: 'Selected Projects',
      description: `เลือกผลงานที่ต้องการแสดงได้สูงสุด ${FEATURED_PROJECT_LIMITS.wedding} รายการ และลากเพื่อจัดลำดับ`,
      type: 'array',
      hidden: ({ document, parent }) =>
        document?.siteMode !== 'wedding' || parent?.sourceType !== 'curated',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }],
        },
      ],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { sourceType?: string } | undefined;
          return validateProjectSelection(
            value,
            parent?.sourceType,
            context.document?.siteMode,
            'wedding'
          );
        }),
    }),
    defineField({
      name: 'ctaButton',
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
    },
    prepare({ title, sourceType }) {
      const sourceLabel = sourceType === 'latest' ? 'Auto (Latest)' : 'Curated';

      return {
        title: title ? `${title} section` : 'Featured Projects Section',
        subtitle: sourceLabel,
      };
    },
  },
});
