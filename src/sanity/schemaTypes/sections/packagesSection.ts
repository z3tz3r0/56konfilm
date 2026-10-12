import { defineField, defineType } from 'sanity';
import { localizedBlockType } from '../objects/localized';
import { packageItemType } from '../objects/packageItem';
import {
  packageReferenceOptions,
  validatePackageReferences,
} from '../../lib/packageValidation';

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
      name: 'sourceType',
      title: 'แหล่งข้อมูลแพ็กเกจ',
      description:
        'เลือกกรอกข้อมูลในการ์ดนี้ หรือใช้แพ็กเกจกลางที่แก้ไขร่วมกับตารางเปรียบเทียบได้',
      type: 'string',
      options: {
        list: [
          { title: 'กรอกข้อมูลใน section นี้', value: 'inline' },
          { title: 'เลือกจากแพ็กเกจกลาง', value: 'catalog' },
        ],
        layout: 'radio',
      },
      initialValue: 'inline',
      validation: (Rule) =>
        Rule.custom((value) =>
          value === undefined || value === 'inline' || value === 'catalog'
            ? true
            : 'กรุณาเลือกแหล่งข้อมูลแพ็กเกจ'
        ),
    }),
    defineField({
      name: 'packages',
      title: 'Packages',
      description: 'รายการแพ็กเกจ',
      type: 'array',
      of: [{ type: packageItemType.name }],
      hidden: ({ parent }) => parent?.sourceType === 'catalog',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { sourceType?: string } | undefined;
          if (parent?.sourceType === 'catalog' || value === undefined)
            return true;
          return Array.isArray(value) && value.length > 0
            ? true
            : 'กรุณาเพิ่มอย่างน้อยหนึ่งแพ็กเกจ';
        }),
    }),
    defineField({
      name: 'selectedPackages',
      title: 'แพ็กเกจที่เลือก',
      description:
        'เลือกแพ็กเกจกลางของโหมดนี้ และลากเพื่อจัดลำดับ ชื่อ ราคา ปุ่ม และรายการเด่นจะอัปเดตตามข้อมูลกลาง',
      type: 'array',
      hidden: ({ parent }) => parent?.sourceType !== 'catalog',
      of: [
        {
          type: 'object',
          name: 'selectedPackage',
          title: 'แพ็กเกจที่เลือก',
          fields: [
            defineField({
              name: 'packageRef',
              title: 'แพ็กเกจ',
              type: 'reference',
              to: [{ type: 'package' }],
              options: packageReferenceOptions,
            }),
            defineField({
              name: 'featured',
              title: 'ไฮไลต์การ์ดนี้',
              description: 'เน้นการ์ดแพ็กเกจนี้เฉพาะใน section นี้',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: 'packageRef.title.0.value', featured: 'featured' },
            prepare({ title, featured }) {
              return {
                title: title || 'เลือกแพ็กเกจ',
                subtitle: featured ? 'ไฮไลต์' : '',
              };
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { sourceType?: string } | undefined;
          if (parent?.sourceType !== 'catalog') return true;
          return validatePackageReferences(
            Array.isArray(value)
              ? value.map(
                  (item) =>
                    (item as { packageRef?: unknown } | undefined)?.packageRef
                )
              : value,
            context,
            'package'
          );
        }),
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
      selectedPackages: 'selectedPackages',
      sourceType: 'sourceType',
      background: 'background',
    },
    prepare({ title, packages, selectedPackages, sourceType, background }) {
      const entries = sourceType === 'catalog' ? selectedPackages : packages;
      const count = Array.isArray(entries) ? entries.length : 0;
      const subtitleParts = [
        sourceType === 'catalog' ? 'Catalog' : null,
        background && background !== 'default' ? background : null,
        `${count} package${count === 1 ? '' : 's'}`,
      ];
      return {
        title: title ? `${title} section` : 'Packages Section',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
      };
    },
  },
});
