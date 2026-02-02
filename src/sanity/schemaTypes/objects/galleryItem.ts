import { defineField, defineType } from 'sanity';
import { localizedStringField } from './localized';
import { mediaBlockType } from './mediaBlock';

export const galleryItemType = defineType({
  name: 'galleryItem',
  title: 'Gallery Item',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'media',
      title: 'Image',
      description: 'รูปภาพที่จะแสดง',
      type: mediaBlockType.name,
      hidden: ({ parent }) => parent?.mediaType === 'video',
    }),
    defineField({
      name: 'videoFile',
      title: 'Video File',
      description: 'ไฟล์วิดีโอ (MP4/WebM)',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    localizedStringField({ name: 'label', title: 'Label', description: 'ข้อความที่แสดงบนสื่อ' }),
  ],
  preview: {
    select: { title: 'label.0.value', media: 'media.image' },
    prepare({ title, media }) {
      return { title: title || 'Gallery Item', media };
    },
  },
});

