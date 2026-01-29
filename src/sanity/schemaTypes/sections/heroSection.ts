import { defineField, defineType } from 'sanity';
import { backgroundMediaType } from '../objects/backgroundMedia';
import { ctaType } from '../objects/cta';
import { localizedStringField } from '../objects/localized';

export const heroSectionType = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    localizedStringField({ name: 'title', title: 'Title', description: 'หัวข้อของ Hero Section' }),
    localizedStringField({ name: 'tagline', title: 'Tagline', description: 'คำโปรยของ Hero Section' }),
    defineField({
      name: 'backgroundMedia',
      title: 'Background Media',
      description: 'เลือกรูปภาพหรือวิดีโอพื้นหลัง (รองรับเพียง 1 รายการ)',
      type: backgroundMediaType.name,
    }),
    defineField({ name: 'ctas', title: 'CTAs', description: 'ปุ่ม CTA', type: 'array', of: [{ type: ctaType.name }] }),
  ],
  
  preview: {
    select: {
      title: 'title.0.value',
      tagline: 'tagline.0.value',
      media: 'backgroundMedia.mediaAsset[0]',
    },
    prepare({ title, tagline, media }) {
      return {
        title: title || 'Hero Section',
        subtitle: tagline || 'Hero Section',
        media,
      };
    },
  },
});
