import { defineField, defineType } from 'sanity';

import {
  ImageAssetValue,
  SanityValidationContext,
  validateImageAssetSizeWarning,
} from './backgroundMedia';
import { localizedStringField, localizedTextField } from './localized';

export const seoObjectType = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description:
        'หัวข้อสำหรับผลค้นหาและตอนแชร์ลิงก์ (แนะนำ 50-60 ตัวอักษร และใส่คีย์เวิร์ดหลักไว้ช่วงต้น)',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value || !Array.isArray(value)) return true;
          const enTitle = value.find((v) => v._key === 'en')?.value || '';
          const thTitle = value.find((v) => v._key === 'th')?.value || '';
          if (enTitle.length > 60 || thTitle.length > 60) {
            return 'Title is too long (over 60 chars). It might be truncated in search results.';
          }
          return true;
        }).warning(),
    }),
    localizedTextField({
      name: 'description',
      title: 'Description',
      description:
        'คำอธิบายใต้หัวข้อบน Google (แนะนำ 120-160 ตัวอักษร)',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value || !Array.isArray(value)) return true;
          const enDesc = value.find((v) => v._key === 'en')?.value || '';
          const thDesc = value.find((v) => v._key === 'th')?.value || '';
          if (enDesc.length > 160 || thDesc.length > 160) {
            return 'Description is too long (over 160 chars). It might be truncated.';
          }
          if ((enDesc.length > 0 && enDesc.length < 50) || (thDesc.length > 0 && thDesc.length < 50)) {
            return 'Description is a bit short. Try to add more details for better SEO.';
          }
          return true;
        }).warning(),
    }),
    localizedStringField({
      name: 'keywords',
      title: 'Keywords',
      description: 'คำสำคัญ (เช่น: production house, wedding film, cinematographers) แยกด้วยจุลภาค',
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      description:
        'ภาพที่ใช้เวลาแชร์ลงโซเชียล (แนะนำ 1200x630 px, ขนาดไม่เกิน 1MB, ข้อความบนภาพควรสั้นและอ่านง่าย)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.custom((value, context) =>
          validateImageAssetSizeWarning(
            value as ImageAssetValue | undefined,
            context as SanityValidationContext
          )
        ).warning(),
    }),
  ],
  preview: {
    select: {
      title: 'title.0.value',
      subtitle: 'description.0.value',
      media: 'ogImage',
    },
  },
});
