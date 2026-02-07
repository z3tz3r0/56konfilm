import { defineField, defineType } from 'sanity';
import {
    ImageAssetValue,
    SanityValidationContext,
    validateImageAssetSizeWarning,
} from './objects/backgroundMedia';
import { localizedStringField, localizedTextField } from './objects/localized';

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'main', title: 'Main', default: true },
    { name: 'content', title: 'Page Builder' },
    { name: 'metadata', title: 'Project Metadata' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'หัวข้อโปรเจกต์',
      group: 'main',
      validation: (Rule) =>
        Rule.required().error('Project title is required before publishing.'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'URL ที่จะแสดงผลสำหรับโปรเจกต์นี้',
      type: 'slug',
      group: 'main',
      options: {
        source: 'title.0.value',
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required().error(
          'URL Slug is required for the project to be viewable on the site.'
        ),
    }),
    defineField({
      name: 'siteMode',
      title: 'Site Mode',
      description: 'โปรเจกต์นี้จะแสดงในโหมดไหน',
      type: 'array',
      group: 'main',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Production', value: 'production' },
          { title: 'Wedding', value: 'wedding' },
        ],
      },
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error(
            'At least one site mode (Production/Wedding) must be selected.'
          ),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      description: 'ลูกค้า / เจ้าของงาน (e.g., Toyota, PTT)',
      type: 'string',
      group: 'metadata',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      description: 'ปีที่ผลิต (e.g., "2024")',
      type: 'string',
      group: 'metadata',
    }),
    defineField({
      name: 'services',
      title: 'Services',
      description: 'บริการที่ทำ (e.g., Production, Editing, Color Grading)',
      type: 'array',
      group: 'metadata',
      of: [{ type: 'string' }],
    }),
    localizedTextField({
      name: 'overview',
      title: 'Overview',
      description: 'รายละเอียดโปรเจกต์',
      group: 'main',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      description: 'รูปภาพหน้าปกโปรเจกต์',
      type: 'image',
      group: 'main',
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.custom((value, context) =>
          validateImageAssetSizeWarning(
            value as ImageAssetValue | undefined,
            context as SanityValidationContext
          )
        ).warning(),
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      description: 'เนื้อหาในรูปแบบ Magazine Layout',
      group: 'content',
      type: 'array',
      of: [
        { type: 'heroSection' },
        { type: 'mediaGallerySection' },
        { type: 'twoColumnSection' },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      description: 'วันที่เผยแพร่',
      type: 'datetime',
      group: 'metadata',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      description: 'Metadata สำหรับ Search และ Social',
      type: 'seo',
      group: 'seo',
    }),
  ],
});
