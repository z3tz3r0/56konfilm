import { defineField, defineType } from 'sanity';
import { localizedStringField } from './objects/localized';

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  groups: [
    { name: 'settings', title: 'Settings', default: true },
    { name: 'commercial', title: 'Commercial Content' },
    { name: 'wedding', title: 'Wedding Content' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    localizedStringField({
      name: 'page',
      title: 'Page Name',
      description: 'ชื่อหน้า',
      group: 'settings',
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
          { title: 'Both (Dual-Mode)', value: 'both' },
        ],
        layout: 'radio',
      },
      initialValue: 'production',
      validation: (Rule) => Rule.required(),
      group: 'settings',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'URL ที่จะแสดงผลสำหรับหน้านี้',
      type: 'slug',
      options: {
        source: 'page',
        isUnique: async (slug, context) => {
          const { document, getClient } = context;
          const client = getClient({ apiVersion: '2023-01-01' });
          const id = document?._id.replace(/^drafts\./, '');
          const params = {
            draft: `drafts.${id}`,
            published: id,
            slug,
          };

          const query = `count(*[
            _type == "page" && 
            slug.current == $slug &&
            !(_id in [$draft, $published])
          ])`;

          const result = await client.fetch(query, params);
          return result === 0;
        },
      },
      group: 'settings',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks (Commercial)',
      description: 'บล็อกเนื้อหาสำหรับโหมด Commercial',
      group: 'commercial',
      type: 'array',
      of: [
        { type: 'heroSection' },
        { type: 'twoColumnSection' },
        { type: 'cardCollectionSection' },
        { type: 'timelineSection' },
        { type: 'mediaGallerySection' },
        { type: 'logoGridSection' },
        { type: 'ctaBannerSection' },
        { type: 'packagesSection' },
        { type: 'testimonialSection' },
        { type: 'philosophySection' },
      ],
      hidden: ({ document }) => document?.siteMode === 'wedding',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const mode = context.document?.siteMode;
          if (mode === 'both' || mode === 'production') {
            return value && value.length > 0
              ? true
              : 'Commercial content blocks are required for this site mode.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'contentBlocksWedding',
      title: 'Content Blocks (Wedding)',
      description: 'บล็อกเนื้อหาสำหรับโหมด Wedding',
      group: 'wedding',
      type: 'array',
      of: [
        { type: 'heroSection' },
        { type: 'twoColumnSection' },
        { type: 'cardCollectionSection' },
        { type: 'timelineSection' },
        { type: 'mediaGallerySection' },
        { type: 'logoGridSection' },
        { type: 'ctaBannerSection' },
        { type: 'packagesSection' },
        { type: 'testimonialSection' },
        { type: 'philosophySection' },
      ],
      hidden: ({ document }) => document?.siteMode === 'production',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const mode = context.document?.siteMode;
          if (mode === 'both' || mode === 'wedding') {
            return value && value.length > 0
              ? true
              : 'Wedding content blocks are required for this site mode.';
          }
          return true;
        }),
    }),
    localizedStringField({
      name: 'seoTitle',
      title: 'SEO Title',
      description: 'หัวข้อ SEO',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'page.0.value',
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
