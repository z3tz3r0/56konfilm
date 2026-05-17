import { defineField, defineType } from 'sanity';
import { PlayIcon } from '@sanity/icons';
import { localizedBlockType, localizedStringField } from '../objects/localized';
import {
  ImageAssetValue,
  SanityValidationContext,
  validateImageAssetSizeWarning,
} from '../objects/backgroundMedia';

export const videoShowreelSectionType = defineType({
  name: 'videoShowreelSection',
  title: 'Video Showreel Section',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วนวิดีโอ (ไม่จำเป็น)',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      description: 'ลิงก์วิดีโอจาก YouTube หรือ Vimeo',
      type: 'url',
      validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      description: 'รูปภาพปกวิดีโอ (แนะนำอัตราส่วน 16:9, ขนาดไม่เกิน 1MB)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.required()
          .custom((value, context) =>
            validateImageAssetSizeWarning(
              value as ImageAssetValue | undefined,
              context as SanityValidationContext
            )
          )
          .warning(),
    }),
    localizedStringField({
      name: 'caption',
      title: 'Caption',
      description: 'คำอธิบายวิดีโอสั้นๆ (ไม่จำเป็น)',
    }),
    defineField({
      name: 'background',
      title: 'Background',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Muted', value: 'muted' },
          { title: 'Contrast', value: 'contrast' },
        ],
        layout: 'radio',
      },
      initialValue: 'default',
    }),
  ],
  preview: {
    select: { title: 'heading.heading.0.value', url: 'videoUrl' },
    prepare({ title, url }) {
      return {
        title: title || 'Video Showreel',
        subtitle: url || 'No URL set',
      };
    },
  },
});
