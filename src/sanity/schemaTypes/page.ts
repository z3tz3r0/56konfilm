import { defineField, defineType } from 'sanity';

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'page',
      title: 'Page Name',
      description: 'ชื่อหน้า',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'siteMode',
      title: 'Site Mode',
      description: 'หน้านี้จะแสดงในโหมดไหน',
      type: 'string',
      options: {
        list: [
          { title: 'Production', value: 'production' },
          { title: 'Wedding', value: 'wedding' },
        ],
        layout: 'radio',
      },
      initialValue: 'production',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'URL ที่จะแสดงผลสำหรับหน้านี้',
      type: 'slug',
      options: {
        source: 'page',
      },
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Block',
      description: 'บล็อกเนื้อหาของหน้านี้',
      group: 'content',
      type: 'array',
      of: [
        { type: 'heroSection' },
        { type: 'twoColumnSection' },
        { type: 'cardCollectionSection' },
        { type: 'timelineSection' },
        { type: 'mediaGallerySection' },
        { type: 'logoGridSection' },
        { type: 'ctaBannerSection' },
      ],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      description: 'หัวข้อ SEO',
      type: 'string',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'page',
      slug: 'slug.current',
    },
    prepare({ title, slug }) {
      return {
        title: title || 'Untitled Page',
        subtitle: slug || 'No slug',
      };
    },
  },
});
