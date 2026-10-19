import { defineField, defineType } from 'sanity';
import { localizedStringField, localizedTextField } from './localized';
import { getParentSectionFromPath } from '@/sanity/lib/schemaHelpers';

export const timelineStepType = defineType({
  name: 'timelineStep',
  title: 'Timeline Step',
  type: 'object',
  fields: [
    defineField({
      name: 'order',
      title: 'Order',
      description: 'ลำดับของขั้นตอน',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    }),
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'หัวข้อของขั้นตอน',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({
      name: 'description',
      title: 'Description',
      description: 'คำอธิบายของขั้นตอน',
    }),
    defineField({
      name: 'iconPicker',
      title: 'Icon',
      description:
        'เลือก Icon สำหรับขั้นตอนนี้เมื่อเปิด "Show Icons on Cards?" ที่ระดับ Section',
      type: 'icon',
      /** Hide the picker unless its owning Timeline section explicitly enables icons. */
      hidden: ({ document, path }) => {
        const section = getParentSectionFromPath(document, path);
        return section?._type !== 'timelineSection' || section.hasIcon !== true;
      },
      /** Require a nonblank picker name only when the owning section enables icons. */
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const section = getParentSectionFromPath(
            context.document,
            context.path
          );
          if (
            section?._type !== 'timelineSection' ||
            section.hasIcon !== true
          ) {
            return true;
          }
          const name = (value as { name?: unknown } | undefined)?.name;
          return typeof name === 'string' && name.trim()
            ? true
            : 'Please choose an icon for this step';
        }),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      description: 'ไอคอน PNG ของขั้นตอน',
      options: { hotspot: true },
      hidden: true,
    }),
  ],
  preview: {
    select: { title: 'title.0.value', order: 'order' },
    prepare({ title, order }) {
      return {
        title: title || 'Timeline Step',
        subtitle: order ? `Step ${order}` : undefined,
      };
    },
  },
});
