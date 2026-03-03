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
      title: 'Title Override',
      description:
        'หัวข้อที่จะแสดงในหน้าผลการค้นหา (Google) และเวลาแชร์ลิงก์ (แนะนำ 50-60 ตัวอักษร พยายามใส่คีย์เวิร์ดสำคัญไว้ข้างหน้า หากไม่ใส่ระบบจะดึงชื่อหน้าไปใช้แทน)',
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
      title: 'Meta Description',
      description:
        'สรุปเนื้อหาที่แสดงใต้หัวข้อบน Google (แนะนำ 120-160 ตัวอักษร เขียนให้น่าดึงดูดใจเพื่อเพิ่มโอกาสให้คนคลิกเข้ามาดู)',
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
      description:
        'คำสำคัญที่เกี่ยวข้องกับหน้านี้ (เช่น: production house, wedding film, cinematographer) แยกแต่ละคำด้วยเครื่องหมายจุลภาค (,)',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Share Image',
      description:
        'รูปภาพที่จะแสดงเวลาแชร์ลิงก์ลงโซเชียล (แนะนำขนาด 1200x630 px, ไฟล์ไม่เกิน 1MB, เน้นภาพที่สื่อสารชัดเจนและดึงดูดสายตา)',
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
