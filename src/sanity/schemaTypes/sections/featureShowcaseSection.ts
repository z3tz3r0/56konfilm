import { defineField, defineType, defineArrayMember } from 'sanity';
import { ComponentIcon } from '@sanity/icons';
import { localizedBlockType } from '../objects/localized';
import { featureItemType } from '../objects/featureItem';

export const featureShowcaseSectionType = defineType({
  name: 'featureShowcaseSection',
  title: 'Feature Showcase Section',
  type: 'object',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วน Feature Showcase',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'features',
      title: 'Features',
      description: 'รายการ Feature ที่ต้องการแสดง',
      type: 'array',
      of: [defineArrayMember({ type: featureItemType.name })],
      validation: (Rule) => Rule.min(2).max(8),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      description: 'รูปแบบการแสดงผล',
      type: 'string',
      options: {
        list: [
          { title: 'Accordion + Image (interactive)', value: 'accordion' },
          { title: 'Icon Grid (simple cards)', value: 'grid' },
        ],
        layout: 'radio',
      },
      initialValue: 'accordion',
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
    select: {
      title: 'heading.heading.0.value',
      features: 'features',
      layout: 'layout',
    },
    prepare({ title, features, layout }) {
      const count = Array.isArray(features) ? features.length : 0;
      return {
        title: title || 'Feature Showcase Section',
        subtitle: `${count} feature${count === 1 ? '' : 's'} · ${layout ?? 'accordion'}`,
      };
    },
  },
});
