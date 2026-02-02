import { defineField, defineType } from 'sanity';
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
      description: 'หัวข้อโปรเจค',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'URL ที่จะแสดงผลสำหรับโปรเจคนี้',
      type: 'slug',
      group: 'main',
      options: {
        source: 'title.0.value',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'siteMode',
      title: 'Site Mode',
      description: 'โปรเจคนี้จะแสดงในโหมดไหน',
      type: 'array',
      group: 'main',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Production', value: 'production' },
          { title: 'Wedding', value: 'wedding' },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
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
      description: 'รายละเอียดโปรเจค',
      group: 'main',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      description: 'รูปภาพหน้าปกโปรเจค',
      type: 'image',
      group: 'main',
      options: { hotspot: true },
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
  ],
});
