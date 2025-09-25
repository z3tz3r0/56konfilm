import { defineField, defineType } from 'sanity';

export const backgroundMediaType = defineType({
  name: 'backgroundMedia',
  title: 'Background Media',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaAsset',
      title: 'Media Asset',
      description: 'เลือกรูปภาพหรือวิดีโอสำหรับใช้เป็นพื้นหลัง',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
        defineField({
          name: 'backgroundVideo',
          title: 'Video',
          type: 'file',
          options: {
            accept: 'video/*',
          },
        }),
      ],
      validation: (Rule) => Rule.max(1),
    }),
  ],
});
