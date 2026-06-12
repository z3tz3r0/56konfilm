import { defineArrayMember, defineField, defineType } from 'sanity';
import { backgroundMediaType } from '../objects/backgroundMedia';
import { ctaType } from '../objects/cta';
import { localizedStringField } from '../objects/localized';

export const heroSectionType = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'หัวข้อของ Hero Section',
    }),
    defineField({
      name: 'enableRotatingText',
      title: 'Enable Rotating Text Effect?',
      description:
        'เปิดใช้งานเอฟเฟกต์สลับคำ (ข้อความจะสลับเปลี่ยนไปมาอัตโนมัติ)',
      type: 'boolean',
      options: { layout: 'checkbox' },
      initialValue: false,
    }),
    defineField({
      name: 'rotatingWords',
      title: 'Words for Rotating Effect',
      description:
        'เพิ่มชุดคำหรือข้อความที่ต้องการให้แสดงสลับกัน (พิมพ์ข้อความแล้วกด Enter เพื่อเพิ่มคำ แนะนำให้ใช้ข้อความสั้นๆ)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'localizedWord',
          title: 'Localized Word',
          fields: [
            { name: 'en', title: 'English (EN)', type: 'string' },
            { name: 'th', title: 'ภาษาไทย (TH)', type: 'string' },
          ],
          preview: {
            select: {
              title: 'en',
              subtitle: 'th',
            },
            prepare({ title, subtitle }) {
              return {
                title: title || 'Missing English Language',
                subtitle: subtitle || 'Missing Thai Language',
              };
            },
          },
        }),
      ],
      hidden: ({ parent }) => !parent?.enableRotatingText,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.hidden) return true;
          if (!value || value.length < 2) {
            return 'Please enter at least two words.';
          }
          return true;
        }),
    }),
    localizedStringField({
      name: 'tagline',
      title: 'Tagline',
      description: 'คำโปรยของ Hero Section',
    }),
    localizedStringField({
      name: 'parallaxText',
      title: 'Parallax Text',
      description: 'ข้อความสำหรับ Effect Parallax ("WE SHOOT HARD")',
    }),
    defineField({
      name: 'shapeDivider',
      title: 'Shape Divider',
      description: 'ตัวเลือกสำหรับการแสดง Shape Divider',
      type: 'boolean',
      options: { layout: 'checkbox' },
      initialValue: false,
      hidden: ({ document }) => document?.siteMode !== 'wedding',
    }),
    defineField({
      name: 'backgroundMedia',
      title: 'Background Media',
      description:
        'เลือกรูปภาพหรือวิดีโอพื้นหลัง (รองรับ 1-2 รายการ: วิดีโอ + poster สำหรับ blur-up)',
      type: backgroundMediaType.name,
    }),
    defineField({
      name: 'ctas',
      title: 'CTAs',
      description: 'ปุ่ม CTA',
      type: 'array',
      of: [{ type: ctaType.name }],
    }),
  ],

  preview: {
    select: {
      tagline: 'title.0.value',
      media: 'backgroundMedia.mediaAsset[0]',
    },
    prepare({ tagline, media }) {
      return {
        title: 'Hero section',
        subtitle: tagline || 'Hero Section',
        media,
      };
    },
  },
});
