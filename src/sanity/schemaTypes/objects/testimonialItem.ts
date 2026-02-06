import { defineField, defineType } from 'sanity';
import { localizedTextField } from './localized';

export const testimonialItemType = defineType({
  name: 'testimonialItem',
  title: 'Testimonial Item',
  type: 'object',
  fields: [
    localizedTextField({
      name: 'quote',
      title: 'Quote',
      description: 'คำรีวิว',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      description: 'ชื่อผู้รีวิว',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authorTitle',
      title: 'Author Title',
      description: 'ตำแหน่ง/บทบาทผู้รีวิว',
      type: 'string',
    }),
    defineField({
      name: 'authorImage',
      title: 'Author Image',
      description: 'รูปผู้รีวิว',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
});
