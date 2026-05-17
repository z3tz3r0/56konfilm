import { defineField, defineType } from 'sanity';
import { localizedStringField } from './objects/localized';
import { validateSlugUniquenessByMode } from '@/sanity/lib/slug';

export const pageType = defineType({
  name: 'page',
  type: 'document',
  groups: [
    { name: 'settings', title: 'Settings', default: true },
    { name: 'commercialSections', title: 'Section Management' },
    { name: 'weddingSections', title: 'Section Management' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // --- Settings ---
    localizedStringField({
      name: 'page',
      title: 'Page Name',
      description:
        'ชื่อหน้า (จะแสดงผลภายในระบบ และใช้เป็นชื่อหน้าหลักสำหรับ SEO หากไม่ได้ระบุ SEO Title แยกต่างหาก)',
      group: 'settings',
    }),
    defineField({
      name: 'siteMode',
      type: 'string',
      hidden: true, // ซ่อนไว้เพราะล็อกค่าตาม document ที่เรียกใช้แล้ว
      options: {
        list: [
          { title: 'Production', value: 'production' },
          { title: 'Wedding', value: 'wedding' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      group: 'settings',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description:
        'URL ที่จะใช้เข้าถึงหน้านี้ (เช่น "about", "services") ไม่ต้องใส่เครื่องหมาย / ด้านหน้า พยายามให้สั้นและมีคีย์เวิร์ดที่เกี่ยวข้องเพื่อผลดีต่อ SEO',
      type: 'slug',
      options: {
        source: 'page',
        isUnique: validateSlugUniquenessByMode,
      },
      group: 'settings',
      validation: (Rule) => Rule.required(),
    }),

    // --- Sections Management ---
    defineField({
      name: 'commercialSections',
      title: 'Commercial Sections',
      description:
        'ส่วนสำหรับจัดการเนื้อหาของหน้านี้ (สามารถเพิ่ม/ลบ หรือจัดลำดับ section ต่างๆ ได้อย่างอิสระ)',
      group: 'commercialSections',
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
        { type: 'statsCounterSection' },
        { type: 'teamSection' },
        { type: 'faqSection' },
        { type: 'videoShowreelSection' },
      ],
      hidden: ({ document }) => document?.siteMode !== 'production',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          // ถ้าโหมดไม่ใช่ production ไม่ต้องตรวจ (ปล่อยผ่าน)
          if (context.document?.siteMode !== 'production') return true;

          // ถ้าเป็นโหมด production ต้องมีข้อมูลอย่างน้อย 1 ตัว
          if (!value || value.length === 0)
            return 'Page sections are required.';

          return true;
        }),
    }),
    defineField({
      name: 'weddingSections',
      title: 'Wedding Sections',
      description:
        'ส่วนสำหรับจัดการเนื้อหาของหน้านี้ (สามารถเพิ่ม/ลบ หรือจัดลำดับ section ต่างๆ ได้อย่างอิสระ)',
      group: 'weddingSections',
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
        { type: 'statsCounterSection' },
        { type: 'teamSection' },
        { type: 'faqSection' },
        { type: 'videoShowreelSection' },
      ],
      hidden: ({ document }) => document?.siteMode !== 'wedding',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          // ถ้าโหมดไม่ใช่ wedding ไม่ต้องตรวจ (ปล่อยผ่าน)
          if (context.document?.siteMode !== 'wedding') return true;

          // ถ้าเป็นโหมด wedding ต้องมีข้อมูลอย่างน้อย 1 ตัว
          if (!value || value.length === 0)
            return 'Page sections are required.';

          return true;
        }),
    }),

    // --- SEO ---
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
      mode: 'siteMode',
      slug: 'slug.current',
    },
    prepare({ title, mode, slug }) {
      const CapitalizedMode = mode === 'production' ? 'Production' : 'Wedding';
      return {
        title: `${CapitalizedMode} — ${title}` || 'Untitled Page',
        subtitle: slug || 'No slug',
      };
    },
  },
});
