import { defineField, defineType } from 'sanity';
import {
  GalleryCollageThumbnail,
  GalleryGridThumbnail,
  MultiUploadArrayInput,
} from '../../components/inputs';
import { ctaType } from '../objects/cta';
import { galleryItemType } from '../objects/galleryItem';
import { localizedBlockType } from '../objects/localized';
import { mediaBlockType } from '../objects/mediaBlock';

/**
 * Returns whether the section uses Collage in Wedding mode.
 */
function isWeddingCollage(sectionVariant: unknown, siteMode: unknown) {
  return sectionVariant === 'collage' && siteMode === 'wedding';
}

export const mediaGallerySectionType = defineType({
  name: 'mediaGallerySection',
  title: 'Media Gallery Section',
  type: 'object',
  fields: [
    defineField({
      name: 'sectionVariant',
      title: 'Section Variant',
      description: 'เลือกรูปแบบการจัดวางภาพ โดยดูภาพตัวอย่างประกอบ',
      type: 'visualOptions',
      options: {
        showTooltip: true,
        optionSize: 'large',
        shape: 'box',
        list: {
          grid: {
            name: 'Grid — เรียงเป็นตาราง',
            icon: GalleryGridThumbnail,
            default: true,
          },
          collage: {
            name: 'Collage — จัดวางภาพแบบคอลลาจ',
            icon: GalleryCollageThumbnail,
          },
        },
      },
      initialValue: 'grid',
      hidden: ({ document }) => document?.siteMode !== 'wedding',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อของ Media Gallery',
      type: localizedBlockType.name,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as
            | { sectionVariant?: string }
            | undefined;
          if (
            !isWeddingCollage(
              parent?.sectionVariant,
              context.document?.siteMode
            )
          )
            return true;

          const headings = (
            value as { heading?: Array<{ value?: string }> } | undefined
          )?.heading;
          return Array.isArray(headings) &&
            headings.length > 0 &&
            headings.every(
              (item) => typeof item?.value === 'string' && item.value.trim()
            )
            ? true
            : 'กรุณากรอกหัวข้อหลักของ Gallery แบบคอลลาจ';
        }),
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
      hidden: ({ document, parent }) =>
        isWeddingCollage(parent?.sectionVariant, document?.siteMode),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as
            | { sectionVariant?: string }
            | undefined;
          if (
            isWeddingCollage(parent?.sectionVariant, context.document?.siteMode)
          )
            return true;
          return Array.isArray(value) && value.length > 0
            ? true
            : 'Please add at least one media item';
        }),
    }),
    defineField({
      name: 'collageImages',
      title: 'Collage Images',
      description:
        'เลือกภาพให้เหมาะกับแต่ละตำแหน่ง ภาพใช้สร้างบรรยากาศของ Gallery และไม่ลิงก์ไปยังโปรเจกต์',
      type: 'object',
      hidden: ({ document, parent }) =>
        !isWeddingCollage(parent?.sectionVariant, document?.siteMode),
      fields: [
        defineField({
          name: 'smallPortrait',
          title: 'ภาพแนวตั้งขนาดเล็ก',
          description:
            'แสดงด้านขวาบนบนคอมพิวเตอร์ และเหนือหัวข้อบนมือถือ แนะนำภาพแนวตั้งที่วางจุดสำคัญไว้กลางภาพ (สัดส่วนกรอบประมาณ 191:275)',
          type: mediaBlockType.name,
        }),
        defineField({
          name: 'landscape',
          title: 'ภาพแนวนอนด้านล่าง',
          description:
            'แสดงด้านล่างของหัวข้อและปุ่มทั้งบนคอมพิวเตอร์และมือถือ แนะนำภาพแนวนอน (สัดส่วนกรอบประมาณ 523:306)',
          type: mediaBlockType.name,
        }),
        defineField({
          name: 'largePortrait',
          title: 'ภาพขนาดใหญ่ด้านซ้าย',
          description:
            'แสดงเฉพาะบนคอมพิวเตอร์ โดยซ่อนบนมือถือ แนะนำภาพแนวตั้งที่เหมาะกับกรอบกว้าง (สัดส่วนกรอบประมาณ 470:548)',
          type: mediaBlockType.name,
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as
            | { sectionVariant?: string }
            | undefined;
          if (
            !isWeddingCollage(
              parent?.sectionVariant,
              context.document?.siteMode
            )
          )
            return true;

          const images = value as
            | Record<string, { image?: { asset?: { _ref?: string } } }>
            | undefined;
          const slots = [
            ['smallPortrait', 'ภาพแนวตั้งขนาดเล็ก'],
            ['landscape', 'ภาพแนวนอนด้านล่าง'],
            ['largePortrait', 'ภาพขนาดใหญ่ด้านซ้าย'],
          ];
          const missing = slots
            .filter(([name]) => {
              const reference = images?.[name]?.image?.asset?._ref;
              return typeof reference !== 'string' || !reference.trim();
            })
            .map(([, title]) => title);
          return missing.length === 0
            ? true
            : `กรุณาเพิ่มรูปภาพให้ครบสามตำแหน่ง: ${missing.join(', ')}`;
        }),
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
      sectionVariant: 'sectionVariant',
      collageImages: 'collageImages',
      background: 'background',
    },
    /**
     * Builds the Studio preview from the stored variant, background, and item count.
     * For Collage, counts only slots with an image asset reference.
     */
    prepare({ title, items, sectionVariant, collageImages, background }) {
      const isCollage = sectionVariant === 'collage';
      const count = isCollage
        ? [
            collageImages?.smallPortrait,
            collageImages?.landscape,
            collageImages?.largePortrait,
          ].filter((media) => media?.image?.asset?._ref).length
        : Array.isArray(items)
          ? items.length
          : 0;
      const subtitleParts = [
        isCollage ? 'Collage' : null,
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
