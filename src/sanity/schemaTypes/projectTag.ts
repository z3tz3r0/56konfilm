import { defineField, defineType, SanityDocument } from 'sanity';
import { localizedStringField } from './objects/localized';

interface LocalizedStringItem {
  language: string;
  value: string;
}

interface ProjectTagDocument extends SanityDocument {
  title?: LocalizedStringItem[];
}

export const projectTagType = defineType({
  name: 'projectTag',
  title: 'Project Tag',
  type: 'document',
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'ชื่อของ Tag (เช่น Wedding, House, Commercial)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'URL Slug สำหรับ Tag นี้ (ใช้ในการทำ URL หรือ Filter parameter)',
      options: {
        // ใช้ภาษาแรกใน array (มักจะเป็นภาษาอังกฤษ) เป็นตัวตั้งต้นสำหรับ Generate Slug
        source: (doc) => {
          const tagDoc = doc as ProjectTagDocument;
          const titleField = tagDoc.title || [];
          const enTitle = titleField.find((t) => t.language === 'en')?.value;
          return enTitle || titleField[0]?.value || '';
        },
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      // ดึง Logic การแสดงผลแบบเดียวกับที่คุณใช้ใน settings.ts มาเพื่อความชัวร์ครับ
      const label = Array.isArray(title)
        ? title.find((item) => item.language === 'en')?.value ||
          title[0]?.value ||
          'No Label'
        : 'No Label';

      return {
        title: label,
        subtitle: 'Project Tag',
      };
    },
  },
});
