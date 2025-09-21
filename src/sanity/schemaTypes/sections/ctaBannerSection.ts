import { defineField, defineType } from 'sanity';
import { localizedBlockType } from '../objects/localized';
import { mediaBlockType } from '../objects/mediaBlock';
import { ctaType } from '../objects/cta';

export const ctaBannerSectionType = defineType({
  name: 'ctaBannerSection',
  title: 'CTA Banner Section',
  type: 'object',
  fields: [
    defineField({ name: 'content', title: 'Content', type: localizedBlockType.name }),
    defineField({ name: 'media', title: 'Media', type: mediaBlockType.name }),
    defineField({
      name: 'ctas',
      title: 'CTAs',
      type: 'array',
      of: [{ type: ctaType.name }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
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
