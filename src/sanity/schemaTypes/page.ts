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
    // Settings Tab
    localizedStringField({
      name: 'page',
      title: 'Page Name',
      description:
        'ชื่อหน้า (จะแสดงผลภายในระบบ และใช้เป็นชื่อหน้าหลักสำหรับ SEO หากไม่ได้ระบุ SEO Title แยกต่างหาก)',
      group: 'settings',
    }),
    defineField({
      name: 'siteMode',
      title: 'Site Mode',
      description:
        'หน้านี้จะแสดงผลในโหมดไหน (Production: สำหรับงานโฆษณา/ธุรกิจ, Wedding: สำหรับงานแต่งงาน, Both: แสดงทั้งสองโหมด)',
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
      hidden: ({ document }) =>
        ['portfolio', 'services'].includes(
          (document?.slug as { current?: string })?.current || ''
        ),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description:
        'URL ที่จะใช้เข้าถึงหน้านี้ (เช่น "about", "services") ไม่ต้องใส่เครื่องหมาย / ด้านหน้า พยายามให้สั้นและมีคีย์เวิร์ดที่เกี่ยวข้องเพื่อผลดีต่อ SEO',
      type: 'slug',
      options: {
        source: 'page',
        isUnique: async (slug, context) => {
          const document = context?.document;
          const getClient = context?.getClient;

          if (!document || !getClient) {
            return true;
          }

          // During early draft initialization, Studio can call isUnique before revision is ready.
          const id = document?._id;

          if (!id) {
            return true;
          }

          const client = getClient({ apiVersion: '2023-01-01' });
          const cleanId = id.replace(/^drafts\./, '');
          const mode = (document as { siteMode?: string })?.siteMode || 'production';
          const slugCandidate = slug as
            | string
            | { current?: string }
            | undefined;
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
            draft: `drafts.${cleanId}`,
            published: cleanId,
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

    // Commercial Content Tab
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks (Commercial)',
      description:
        'ส่วนสำหรับจัดการเนื้อหาในโหมด Commercial (สามารถเพิ่ม/ลบ หรือจัดลำดับ section ต่างๆ ได้อย่างอิสระ)',
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
      description:
        'ส่วนสำหรับจัดการเนื้อหาในโหมด Wedding (สามารถออกแบบเนื้อหาให้แตกต่างจากโหมด Commercial ได้อย่างสิ้นเชิง)',
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

    // SEO Tab
    localizedStringField({
      name: 'seoTitle',
      title: 'SEO Title',
      description:
        'หัวข้อที่แสดงบน Google (แนะนำ 50-60 ตัวอักษร, ควรใส่คีย์เวิร์ดหลักไว้ช่วงต้นเพื่อประสิทธิภาพสูงสุด)',
      group: 'seo',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      description:
        'การตั้งค่า Meta Tags เพิ่มเติมสำหรับการแชร์ลงโซเชียลมีเดียและการแสดงผลบน Google (หากไม่ใส่ ระบบจะดึงข้อมูลจาก Page Name ให้อัตโนมัติ)',
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
