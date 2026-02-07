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
    }),
    localizedTextField({
      name: 'description',
      title: 'Description',
      description:
        'คำอธิบายใต้หัวข้อบน Google (แนะนำ 120-160 ตัวอักษร: สรุปจุดเด่น + บริการ + พื้นที่ให้บริการ)',
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
