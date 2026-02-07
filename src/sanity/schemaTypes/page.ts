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
      description:
        'URL ของหน้านี้ เช่น about, services, contact (ไม่ต้องใส่ / ด้านหน้า). สามารถใช้ slug เดียวกันข้ามโหมดได้ หากไม่ได้ตั้งเป็น Both',
      type: 'slug',
      options: {
        source: 'page',
        isUnique: async (slug, context) => {
          const { document, getClient } = context;

          if (!document || !getClient) {
            return true;
          }

          // During early draft initialization, Studio can call isUnique before revision is ready.
          if (!document._id || !document._rev) {
            return true;
          }

          const client = getClient({ apiVersion: '2023-01-01' });
          const id = document?._id?.replace(/^drafts\./, '');
          const mode = document?.siteMode || 'production';
          const slugCandidate = slug as string | { current?: string } | undefined;
          const slugValue =
            typeof slugCandidate === 'string'
              ? slugCandidate
              : typeof slugCandidate?.current === 'string'
                ? slugCandidate.current
                : '';

          if (!slugValue) {
            return true;
          }

          const params = {
            draft: id ? `drafts.${id}` : '',
            published: id || '',
            slug: slugValue,
            mode,
          };

          const query =
            mode === 'both'
              ? `count(*[
                  _type == "page" &&
                  slug.current == $slug &&
                  !(_id in [$draft, $published])
                ])`
              : `count(*[
                  _type == "page" &&
                  slug.current == $slug &&
                  !(_id in [$draft, $published]) &&
                  (
                    coalesce(siteMode, "production") == $mode ||
                    siteMode == "both"
                  )
                ])`;

          try {
            const result = await client.fetch(query, params);
            return result === 0;
          } catch (error) {
            console.warn('Slug uniqueness check failed', error);
            return true;
          }
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
      description:
        'หัวข้อที่แสดงบน Google (แนะนำ 50-60 ตัวอักษร, ใส่คีย์เวิร์ดหลักช่วงต้นประโยค)',
      group: 'seo',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      description: 'ตั้งค่า SEO เพิ่มเติมของหน้านี้ (Title, Description, Open Graph Image)',
      type: 'seo',
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
