import { defineField, defineType } from 'sanity';
import { localizedStringField, localizedTextField } from './localized';

export const processItemType = defineType({
  name: 'processItem',
  title: 'Process Step',
  type: 'object',
  fields: [
    defineField({
      name: 'stepNumber',
      title: 'Step Number',
      description: 'หมายเลขขั้นตอน (01, 02, ...)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    }),
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'ชื่อขั้นตอน',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({
      name: 'description',
      title: 'Description',
      description: 'รายละเอียดขั้นตอน',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      description: 'ชื่อ Lucide icon (เช่น Search, Camera, Scissors, Package)',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title.0.value',
      step: 'stepNumber',
    },
    prepare({ title, step }) {
      return {
        title: title || 'Process Step',
        subtitle: step ? `Step ${String(step).padStart(2, '0')}` : '',
      };
    },
  },
});
