import { defineField, defineType } from 'sanity';

type BackgroundMediaItem = {
  _type?: string;
};

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

        const typedItems = items as BackgroundMediaItem[];
        const images = typedItems.filter((item) => item?._type === 'image');
        const videos = typedItems.filter((item) => item?._type === 'backgroundVideo');

        if (videos.length > 1) return 'Only 1 video allowed';
        if (images.length > 1) return 'Only 1 poster image allowed';
        
        if (videos.length > 0 && images.length === 0) {
          return 'Video MUST be paired with a poster image for blur-up effect';
        }

        return true;
      }),
    }),
  ],
});
