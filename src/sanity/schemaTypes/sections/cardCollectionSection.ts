import { defineField, defineType } from 'sanity';
import { cardItemType } from '../objects/cardItem';
import { localizedStringField, localizedTextField } from '../objects/localized';
import { ctaType } from '@/sanity/schemaTypes/objects/cta';

export const cardCollectionSectionType = defineType({
  name: 'cardCollectionSection',
  title: 'Card Collection',
  type: 'object',
  fields: [
    defineField({
      name: 'layoutVariant',
      title: 'Layout Variant',
      type: 'string',
      options: {
        list: [
          { title: 'Standard Grid (Default)', value: 'standard' },
          { title: 'Highlight Intro Box', value: 'highlight-intro' },
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
      hidden: ({ document }) => document?.siteMode !== 'production',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.siteMode !== 'production') return true;
          if (!value) return 'Layout variant option is required';
          return true;
        }),
    }),
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'หัวข้อของ Card Collection',
    }),
    localizedTextField({
      name: 'intro',
      title: 'Intro',
      description: 'คำอธิบายของ Card Collection',
    }),
    defineField({
      name: 'hasButton',
      title: 'Show Button?',
      type: 'boolean',
      description: 'เปิดใช้งานหากต้องการให้การ์ดนี้มีปุ่ม',
      initialValue: false,
      hidden: ({ parent }) =>
        (parent?.layoutVariant || 'standard') !== 'highlight-intro',
    }),
    defineField({
      name: 'ctaButton',
      title: 'CTA',
      description: 'ปุ่ม CTA',
      type: ctaType.name,
      hidden: ({ parent }) =>
        !parent?.hasButton ||
        (parent?.layoutVariant || 'standard') !== 'highlight-intro',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.hidden) return true;

          const parent = context.parent as
            | { hasButton?: boolean; layoutVariant?: string }
            | undefined;
          const currentButtonState = parent?.hasButton ?? false;
          const currentVariant = parent?.layoutVariant || 'standard';

          if (
            currentButtonState &&
            currentVariant === 'highlight-intro' &&
            !value
          ) {
            return 'CTA Button is required when "Show Button?" is enabled';
          }
          return true;
        }),
    }),
    defineField({
      name: 'columns',
      title: 'Columns (lg)',
      description: 'จำนวนคอลัมน์ในหน้าจอขนาดใหญ่',
      type: 'number',
      options: { list: [1, 2, 3, 4] },
      initialValue: 4,
      hidden: ({ parent }) =>
        (parent?.layoutVariant || 'standard') !== 'standard',
    }),
    defineField({
      name: 'hasIcon',
      title: 'Show Icons on Cards?',
      type: 'boolean',
      description: 'เปิดใช้งานเพื่อแสดง Icon บนการ์ดทุกใบใน Section นี้',
      initialValue: true,
      hidden: ({ parent }) => {
        const currentVariant = parent?.layoutVariant || 'standard';
        return currentVariant !== 'standard';
      },
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      description: 'การ์ดที่จะแสดงใน Collection',
      type: 'array',
      of: [{ type: cardItemType.name }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'background',
      title: 'Background',
      description: 'พื้นหลังของ Card Collection',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Muted', value: 'muted' },
          { title: 'Contrast', value: 'contrast' },
        ],
      },
      initialValue: 'default',
    }),
  ],
  preview: {
    select: {
      title: 'title.0.value',
      cards: 'cards',
      background: 'background',
    },
    prepare({ title, cards, background }) {
      const count = Array.isArray(cards) ? cards.length : 0;
      const subtitleParts = [
        background && background !== 'default' ? background : null,
        `${count} card${count === 1 ? '' : 's'}`,
      ];
      return {
        title: title ? `${title} section` : 'Card Collection',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
      };
    },
  },
});
