import { defineField, defineType } from 'sanity';
import { localizedBlockType } from '../objects/localized';
import { packageItemType } from '../objects/packageItem';

export const packagesSectionType = defineType({
  name: 'packagesSection',
  title: 'Packages Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วนแพ็กเกจ',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'packages',
      title: 'Packages',
      description: 'รายการแพ็กเกจ',
      type: 'array',
      of: [{ type: packageItemType.name }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'background',
      title: 'Background',
      description: 'พื้นหลังของส่วนแพ็กเกจ',
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
      packages: 'packages',
      background: 'background',
    },
    prepare({ title, packages, background }) {
      const count = Array.isArray(packages) ? packages.length : 0;
      const subtitleParts = [background && background !== 'default' ? background : null, `${count} package${count === 1 ? '' : 's'}`];
      return {
        title: title || 'Packages Section',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
      };
    },
  },
});
