import { defineField, defineType } from 'sanity';
import { localizedTextField } from '../objects/localized';

export const philosophySectionType = defineType({
  name: 'philosophySection',
  title: 'Philosophy Section',
  type: 'object',
  fields: [
    localizedTextField({
      name: 'quote',
      title: 'Quote',
      description: 'คำพูดหลักของแบรนด์',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'background',
      title: 'Background',
      description: 'พื้นหลังของส่วนปรัชญา',
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
      quote: 'quote.0.value',
      background: 'background',
    },
    prepare({ quote, background }) {
      return {
        title: quote || 'Philosophy Section',
        subtitle: background && background !== 'default' ? background : '',
      };
    },
  },
});
