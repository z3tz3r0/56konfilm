import { defineField, defineType } from 'sanity';

export const backgroundMediaType = defineType({
  name: 'backgroundMedia',
  title: 'Background Media',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaAsset',
      title: 'Media Asset',
      description: 'เลือกรูปภาพหรือวิดีโอสำหรับใช้เป็นพื้นหลัง (สำหรับวิดีโอ: เพิ่มรูปภาพ poster เพื่อ blur-up effect)',
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
      validation: (Rule) => Rule.max(2).custom((items) => {
        if (!items || items.length === 0) return true;
        if (items.length === 1) return true;
        if (items.length === 2) {
          const hasVideo = items.some((item: any) => item._type === 'file');
          const hasImage = items.some((item: any) => item._type === 'image');
          if (hasVideo && hasImage) return true;
          return 'When using 2 items, must be 1 video + 1 image (for poster)';
        }
        return 'Maximum 2 items allowed';
      }),
    }),
  ],
});
