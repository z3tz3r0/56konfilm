import { defineField, defineType } from 'sanity';
import { localizedStringField, localizedTextField } from './localized';
import { ctaType } from './cta';

export const cardItemType = defineType({
  name: 'cardItem',
  title: 'Card Item',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({ name: 'body', title: 'Body' }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Highlighted', value: 'highlighted' },
        ],
      },
      initialValue: 'default',
    }),
    defineField({ name: 'cta', title: 'CTA', type: ctaType.name }),
  ],
});

