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
    defineField({ name: 'heading', title: 'Heading', description: 'หัวข้อของ Media Gallery', type: localizedBlockType.name }),
    defineField({
      name: 'sourceType',
      title: 'Content Source',
      description: 'เลือกว่าจะใช้รายการสื่อแบบ Manual หรือดึงจากรายการ Projects',
      type: 'string',
      options: {
        list: [
          { title: 'Manual Items', value: 'manual' },
          { title: 'Projects (เลือกได้สูงสุด 6)', value: 'projects' },
        ],
        layout: 'radio',
      },
      initialValue: 'manual',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Items',
      description: 'รายการสื่อที่จะแสดงใน Gallery',
      type: 'array',
      components: {
        input: MultiUploadArrayInput,
      },
      of: [{ type: galleryItemType.name }],
      hidden: ({ parent }) => parent?.sourceType === 'projects',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const sourceType = (context.parent as { sourceType?: string } | undefined)?.sourceType;
          if (sourceType === 'projects') return true;
          return value && value.length > 0
            ? true
            : 'กรุณาใส่รายการสื่ออย่างน้อย 1 รายการ หรือเปลี่ยน Source เป็น Projects';
        }),
    }),
    defineField({
      name: 'selectedProjects',
      title: 'Selected Projects',
      description:
        'เลือกโปรเจกต์ที่ต้องการแสดง (ลากเพื่อจัดลำดับได้ ช่องแรกคือการ์ดแรก) สูงสุด 6 รายการ',
      type: 'array',
      hidden: ({ parent }) => parent?.sourceType !== 'projects',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }],
        },
      ],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const sourceType = (context.parent as { sourceType?: string } | undefined)?.sourceType;
          if (sourceType !== 'projects') return true;
          if (!value || value.length === 0) return 'กรุณาเลือกโปรเจกต์อย่างน้อย 1 รายการ';
          if (value.length > 6) return 'เลือกได้สูงสุด 6 โปรเจกต์';
          return true;
        }),
    }),
    defineField({ name: 'cta', title: 'CTA', description: 'ปุ่ม CTA', type: ctaType.name }),
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
      heading: 'heading.heading.0.value',
      items: 'items',
      background: 'background',
    },
    prepare({ heading, items, background }) {
      const count = Array.isArray(items) ? items.length : 0;
      const subtitleParts = [background && background !== 'default' ? background : null, `${count} item${count === 1 ? '' : 's'}`];
      return {
        title: heading || 'Media Gallery Section',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
      };
    },
  },
});
