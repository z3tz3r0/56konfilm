import { defineField, defineType } from 'sanity';
import { localizedStringField, localizedTextField } from './objects/localized';

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'หัวข้อโปรเจค',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'URL ที่จะแสดงผลสำหรับโปรเจคนี้',
      type: 'slug',
      options: {
        source: 'title.0.value',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'siteMode',
      title: 'Site Mode',
      description: 'โปรเจคนี้จะแสดงในโหมดไหน',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Production', value: 'production' },
          { title: 'Wedding', value: 'wedding' },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    localizedTextField({
      name: 'overview',
      title: 'Overview',
      description: 'รายละเอียดโปรเจค',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      description: 'รูปภาพหน้าปกโปรเจค',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      description: 'วันที่เผยแพร่',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
