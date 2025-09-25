import { SanityDocument } from 'next-sanity';
import { defineField, defineType } from 'sanity';
import { localizedStringField } from './objects/localized';

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    localizedStringField({ name: 'title', title: 'Title', description: 'หัวข้อโพสต์' }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'URL ที่จะแสดงผลสำหรับโพสต์นี้',
      type: 'slug',
      options: {
        source: (doc: SanityDocument) => doc.title[0].value,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      description: 'วันที่เผยแพร่โพสต์',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'รูปภาพประกอบโพสต์',
      type: 'image',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      description: 'เนื้อหาโพสต์',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare(selection) {
      const { title } = selection;
      if (!title || title.length === 0) {
        return { title: 'Untitled' };
      }

      const defaultLang = title.find((t: { _key: string }) => t._key === 'en');

      return { title: defaultLang?.value || title[0].value || 'Unititled' };
    },
  },
});
