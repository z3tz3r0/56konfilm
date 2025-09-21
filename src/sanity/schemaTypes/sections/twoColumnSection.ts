import { defineField, defineType } from 'sanity';
import { localizedBlockType } from '../objects/localized';
import { ctaType } from '../objects/cta';
import { mediaBlockType } from '../objects/mediaBlock';

export const twoColumnSectionType = defineType({
  name: 'twoColumnSection',
  title: 'Two Column Section',
  type: 'object',
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      description: 'เค้าโครงของ Two Column Section',
      type: 'string',
      options: {
        list: [
          { title: 'Text Left, Media Right', value: 'textLeft' },
          { title: 'Media Left, Text Right', value: 'textRight' },
        ],
        layout: 'radio',
      },
      initialValue: 'textLeft',
    }),
    defineField({ name: 'content', title: 'Content', description: 'เนื้อหาของ Two Column Section', type: localizedBlockType.name }),
    defineField({ name: 'media', title: 'Media', description: 'สื่อของ Two Column Section', type: mediaBlockType.name }),
    defineField({ name: 'ctas', title: 'CTAs', description: 'ปุ่ม CTA', type: 'array', of: [{ type: ctaType.name }] }),
    defineField({
      name: 'background',
      title: 'Background',
      description: 'พื้นหลังของ Two Column Section',
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
      heading: 'content.heading.0.value',
      eyebrow: 'content.eyebrow.0.value',
      layout: 'layout',
      media: 'media.image',
    },
    prepare({ heading, eyebrow, layout, media }) {
      const subtitleParts = [eyebrow, layout === 'textRight' ? 'Media Left' : 'Text Left'];
      return {
        title: heading || 'Two Column Section',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
