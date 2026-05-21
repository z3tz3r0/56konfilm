import { defineField, defineType } from 'sanity';
import { localizedStringField, localizedTextField } from './localized';
import { getParentSectionFromPath } from '@/sanity/lib/schemaHelpers';

export const cardItemType = defineType({
  name: 'cardItem',
  title: 'Card Item',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'หัวข้อของการ์ด',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({
      name: 'body',
      title: 'Body',
      description: 'เนื้อหาของการ์ด',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'icon',
      description:
        '🎨 ไอคอน (จะแสดงผลก็ต่อเมื่อเปิดใช้งาน "Show Icons" ที่ระดับ Section)',
      hidden: ({ document, path }) => {
        const currentSection = getParentSectionFromPath(document, path);
        const cardCollectionSection =
          currentSection?._type === 'cardCollectionSection';
        const isIconEnabled = currentSection?.hasIcon === true;
        return cardCollectionSection && !isIconEnabled;
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.hidden) return true;
          if (!value) return 'Please choose an icon';
          return true;
        }),
    }),
    defineField({
      name: 'bgImage',
      title: 'Background Image',
      type: 'image',
      description:
        '🖼️ ภาพพื้นหลัง (จะถูกใช้งานเฉพาะเมื่อ Section เลือกรูปแบบเป็น "Highlight Intro" เท่านั้น)',
      options: { hotspot: true },
      hidden: ({ document, path }) => {
        const currentSection = getParentSectionFromPath(document, path);
        const cardCollectionSection =
          currentSection?._type === 'cardCollectionSection';
        const isStandardVariant =
          (currentSection?.layoutVariant || 'standard') === 'standard';
        return cardCollectionSection && isStandardVariant;
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.hidden) return true;
          if (!value) return 'Please choose or upload a background image';
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title.0.value',
      icon: 'icon',
      iconName: 'icon.name',
      bgImage: 'bgImage',
    },
    prepare({ title, icon, iconName, bgImage }) {
      let mediaLabel = '📝 Text Only';
      if (icon) {
        mediaLabel = `🎨 Icon${iconName ? ` (${iconName})` : ''}`;
      } else if (bgImage) {
        mediaLabel = '🖼️ Background Image';
      }

      return {
        title: title || 'Untitled Card',
        subtitle: `${mediaLabel}`,
        media: bgImage || undefined,
      };
    },
  },
});
