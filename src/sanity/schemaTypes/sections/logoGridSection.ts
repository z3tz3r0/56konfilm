import { defineField, defineType } from 'sanity';
import { localizedStringField } from '../objects/localized';
import { logoItemType } from '../objects/logoItem';

export const logoGridSectionType = defineType({
  name: 'logoGridSection',
  title: 'Logo Grid Section',
  type: 'object',
  fields: [
    localizedStringField({ name: 'title', title: 'Title' }),
    defineField({
      name: 'logos',
      title: 'Logos',
      type: 'array',
      of: [{ type: logoItemType.name }],
      validation: (Rule) => Rule.required().min(3),
    }),
    defineField({
      name: 'background',
      title: 'Background',
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
      logos: 'logos',
      background: 'background',
    },
    prepare({ title, logos, background }) {
      const count = Array.isArray(logos) ? logos.length : 0;
      const subtitleParts = [background && background !== 'default' ? background : null, `${count} logo${count === 1 ? '' : 's'}`];
      return {
        title: title || 'Logo Grid Section',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
      };
    },
  },
});
