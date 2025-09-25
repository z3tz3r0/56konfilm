import { defineField, defineType } from 'sanity';
import { localizedStringField, localizedTextField } from '../objects/localized';
import { cardItemType } from '../objects/cardItem';

export const cardCollectionSectionType = defineType({
  name: 'cardCollectionSection',
  title: 'Card Collection',
  type: 'object',
  fields: [
    localizedStringField({ name: 'title', title: 'Title', description: 'หัวข้อของ Card Collection' }),
    localizedTextField({ name: 'intro', title: 'Intro', description: 'คำอธิบายของ Card Collection' }),
    defineField({
      name: 'columns',
      title: 'Columns (lg)',
      description: 'จำนวนคอลัมน์ในหน้าจอขนาดใหญ่',
      type: 'number',
      options: { list: [1, 2, 3, 4] },
      initialValue: 4,
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
      const subtitleParts = [background && background !== 'default' ? background : null, `${count} card${count === 1 ? '' : 's'}`];
      return {
        title: title || 'Card Collection',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
      };
    },
  },
});
