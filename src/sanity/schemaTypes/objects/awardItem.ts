import { defineField, defineType } from 'sanity';
import { localizedStringField } from './localized';
import { StarIcon } from '@sanity/icons';

export const awardItemType = defineType({
  name: 'awardItem',
  title: 'Award',
  type: 'object',
  icon: StarIcon,
  fields: [
    localizedStringField({
      name: 'name',
      title: 'Award Name',
      description: 'ชื่อรางวัล (เช่น Best Cinematography)',
      validation: (Rule) => Rule.required(),
    }),
    localizedStringField({
      name: 'event',
      title: 'Event / Festival',
      description:
        'ชื่องานหรือเทศกาล (เช่น Bangkok International Film Festival)',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      description: 'ปีที่ได้รับรางวัล',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      description: 'โลโก้รางวัล/เทศกาล (ไม่จำเป็น)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: 'name.0.value',
      event: 'event.0.value',
      year: 'year',
    },
    prepare({ title, event, year }) {
      return {
        title: title || 'Award',
        subtitle: [event, year].filter(Boolean).join(' · '),
      };
    },
  },
});
