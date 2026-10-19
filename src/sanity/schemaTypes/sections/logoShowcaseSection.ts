import { defineField, defineType } from 'sanity';
import { localizedBlockType, localizedStringField } from '../objects/localized';
import { logoItemType } from '../objects/logoItem';

export const logoShowcaseSectionType = defineType({
  name: 'logoShowcaseSection',
  title: 'Logo Showcase Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'ข้อความเหนือหัวข้อ หัวข้อหลัก และเนื้อหาของ Logo Showcase',
      type: localizedBlockType.name,
      initialValue: { align: 'center' },
    }),
    localizedStringField({
      name: 'title',
      title: 'Legacy Title',
      description: 'เก็บหัวข้อเดิมไว้ใช้เมื่อยังไม่ได้กรอก Heading ใหม่',
      hidden: true,
    }),
    defineField({
      name: 'logos',
      title: 'Logos',
      description:
        'เพิ่มโลโก้ 3–20 รายการและลากเพื่อจัดลำดับ ระบบใช้ 1 แถวเมื่อมีไม่เกิน 6 รายการ และแบ่งเป็น 2 แถวจำนวนใกล้เคียงกันเมื่อมีตั้งแต่ 7 รายการ',
      type: 'array',
      of: [{ type: logoItemType.name }],
      validation: (Rule) => Rule.required().min(3).max(20),
    }),
    defineField({
      name: 'background',
      title: 'Background',
      description: 'พื้นหลังของ Logo Showcase',
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
      title: 'title.0.value',
      logos: 'logos',
      background: 'background',
    },
    prepare({ heading, title, logos, background }) {
      const count = Array.isArray(logos) ? logos.length : 0;
      const label = [heading, title].find(
        (value) => typeof value === 'string' && value.trim()
      );
      const subtitleParts = [
        background && background !== 'default' ? background : null,
        `${count} logo${count === 1 ? '' : 's'}`,
      ];
      return {
        title: label ? `${label.trim()} section` : 'Logo Showcase Section',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
      };
    },
  },
});
