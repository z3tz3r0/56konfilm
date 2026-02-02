import { defineField, defineType } from 'sanity';
import { ctaType } from '../objects/cta';
import { localizedBlockType } from '../objects/localized';
import { mediaBlockType } from '../objects/mediaBlock';

export const ctaBannerSectionType = defineType({
  name: 'ctaBannerSection',
  title: 'CTA Banner Section',
  type: 'object',
  fields: [
    defineField({ name: 'content', title: 'Content', description: 'เนื้อหาของ CTA Banner', type: localizedBlockType.name }),
    defineField({ name: 'media', title: 'Media', description: 'สื่อของ CTA Banner (Recommended: 1920x512px or 4:1 aspect ratio)', type: mediaBlockType.name }),
    defineField({
      name: 'ctas',
      title: 'CTAs',
      description: 'ปุ่ม CTA',
      type: 'array',
      of: [{ type: ctaType.name }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      description: 'เค้าโครงของ CTA Banner',
      type: 'string',
      options: {
        list: [
          { title: 'Text Left', value: 'textLeft' },
          { title: 'Text Right', value: 'textRight' },
        ],
        layout: 'radio',
      },
      initialValue: 'textLeft',
    }),
    defineField({
      name: 'background',
      title: 'Background',
      description: 'พื้นหลังของ CTA Banner',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Muted', value: 'muted' },
          { title: 'Contrast', value: 'contrast' },
        ],
      },
      initialValue: 'contrast',
    }),
    defineField({
      name: 'customColors',
      title: 'Custom Text Colors',
      description: 'ปรับแต่งสีข้อความ (หากไม่ระบุจะใช้ค่า Default ของ Theme)',
      type: 'object',
      fields: [
        defineField({ name: 'eyebrow', title: 'Eyebrow Color', type: 'color' }),
        defineField({ name: 'heading', title: 'Heading Color', type: 'color' }),
        defineField({ name: 'body', title: 'Body Color', type: 'color' }),
      ],
      options: {
        collapsible: true,
        collapsed: true,
      }
    }),
    defineField({
      name: 'overlay',
      title: 'Background Overlay',
      description: 'ปรับแต่ง Overlay ทับรูปภาพพื้นหลัง',
      type: 'object',
      fields: [
        defineField({ name: 'enabled', title: 'Enable Overlay', type: 'boolean', initialValue: true }),
        defineField({ name: 'color', title: 'Overlay Color', type: 'color' }),
        defineField({ 
          name: 'opacity', 
          title: 'Opacity (%)', 
          type: 'number', 
          validation: (Rule) => Rule.min(0).max(100),
          initialValue: 60 
        }),
      ],
      options: {
        collapsible: true,
        collapsed: true,
      }
    }),
  ],
  preview: {
    select: {
      heading: 'content.heading.0.value',
      layout: 'layout',
      media: 'media.image',
    },
    prepare({ heading, layout, media }) {
      const subtitleParts = [layout === 'textRight' ? 'Text Right' : 'Text Left'];
      return {
        title: heading || 'CTA Banner Section',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
