import { defineField, defineType } from 'sanity';
import { localizedBlockType } from '../objects/localized';
import { testimonialItemType } from '../objects/testimonialItem';

export const testimonialSectionType = defineType({
  name: 'testimonialSection',
  title: 'Testimonial Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วนรีวิว',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      description: 'รายการรีวิว',
      type: 'array',
      of: [{ type: testimonialItemType.name }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'background',
      title: 'Background',
      description: 'พื้นหลังของส่วนรีวิว',
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
      title: 'heading.heading.0.value',
      testimonials: 'testimonials',
      background: 'background',
    },
    prepare({ title, testimonials, background }) {
      const count = Array.isArray(testimonials) ? testimonials.length : 0;
      const subtitleParts = [
        background && background !== 'default' ? background : null,
        `${count} testimonial${count === 1 ? '' : 's'}`,
      ];
      return {
        title: title || 'Testimonial Section',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
      };
    },
  },
});
