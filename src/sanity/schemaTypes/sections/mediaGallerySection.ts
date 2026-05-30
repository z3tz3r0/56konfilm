import { defineField, defineType } from 'sanity';
import { MultiUploadArrayInput } from '../../components/inputs/MultiUploadArrayInput';
import { ctaType } from '../objects/cta';
import { galleryItemType } from '../objects/galleryItem';
import { localizedBlockType } from '../objects/localized';

export const mediaGallerySectionType = defineType({
  name: 'mediaGallerySection',
  title: 'Media Gallery Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อของ Media Gallery',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'items',
      title: 'Items',
      description:
        'รายการสื่อที่จะแสดงใน Gallery (ใช้สำหรับภาพถ่ายหรือวิดีโอทั่วไป)',
      type: 'array',
      components: {
        input: MultiUploadArrayInput,
      },
      of: [{ type: galleryItemType.name }],
      validation: (Rule) =>
        Rule.required().min(1).error('Please add at least one media item'),
    }),
    defineField({
      name: 'cta',
      title: 'CTA',
      description: 'ปุ่ม CTA',
      type: ctaType.name,
    }),
    defineField({
      name: 'background',
      title: 'Background',
      description: 'พื้นหลังของ Media Gallery',
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
      items: 'items',
      background: 'background',
    },
    prepare({ title, items, background }) {
      const count = Array.isArray(items) ? items.length : 0;
      const subtitleParts = [
        background && background !== 'default' ? background : null,
        `${count} item${count === 1 ? '' : 's'}`,
      ];
      return {
        title: title ? `${title} section` : 'Media Gallery Section',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
      };
    },
  },
});
