import { defineField, defineType, SanityDocument } from 'sanity';
import { localizedStringField, localizedTextField } from './localized';

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
      hidden: ({ document, parent }) => {
        // ป้องกัน Error กรณีที่ Sanity กำลังโหลด หรือการ์ดยังไม่มี _key (เพิ่งกด Add)
        const { _key } = parent;
        if (!document || !parent || !_key) return false;

        const cardCollectionSection = findParentCardCollectionSection(
          document,
          _key
        );
        const isIconEnabled = cardCollectionSection?.hasIcon === true;

        return !isIconEnabled;
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
      hidden: ({ document, parent }) => {
        // ป้องกัน Error กรณีที่ Sanity กำลังโหลด หรือการ์ดยังไม่มี _key (เพิ่งกด Add)
        const { _key } = parent;
        if (!document || !parent || !_key) return false;

        const cardCollectionSection = findParentCardCollectionSection(
          document,
          _key
        );
        const currentVariant =
          cardCollectionSection?.layoutVariant || 'standard';

        return currentVariant === 'standard';
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

function findParentCardCollectionSection(
  document: SanityDocument | undefined,
  cardKey: string | undefined
) {
  if (!document || !cardKey) return undefined;

  const allSections = [
    ...(Array.isArray(document?.commercialSections)
      ? document.commercialSections
      : []),
    ...(Array.isArray(document?.weddingSections)
      ? document.weddingSections
      : []),
  ];

  return allSections.find((section) => {
    if (section._type !== 'cardCollectionSection') return false;
    if (!Array.isArray(section.cards)) return false;
    return section.cards.some(
      (card: { _key: string }) => card._key === cardKey
    );
  });
}
