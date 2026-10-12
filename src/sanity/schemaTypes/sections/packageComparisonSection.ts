import { defineField, defineType } from 'sanity';
import {
  hasLocalizedPackageText,
  packageReferenceOptions,
  validatePackageReferences,
} from '../../lib/packageValidation';
import { localizedBlockType, localizedStringField } from '../objects/localized';

export const packageComparisonSectionType = defineType({
  name: 'packageComparisonSection',
  title: 'Package Comparison',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: localizedBlockType.name,
      validation: (Rule) =>
        Rule.required().custom((value) =>
          hasLocalizedPackageText(
            (value as { heading?: unknown } | undefined)?.heading
          )
            ? true
            : 'กรุณากรอกหัวข้อหลักของตารางเปรียบเทียบ'
        ),
    }),
    defineField({
      name: 'groups',
      title: 'กลุ่มแพ็กเกจ',
      description:
        'สร้างกลุ่มที่ผู้ชมเลือกสลับได้ เช่น Budget Friendly หรือ Most Popular และลากเพื่อจัดลำดับ',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: 'object',
          name: 'packageComparisonGroup',
          title: 'กลุ่มแพ็กเกจ',
          fields: [
            localizedStringField({
              name: 'label',
              title: 'ชื่อกลุ่ม',
              validation: (Rule) =>
                Rule.required().custom((value) =>
                  hasLocalizedPackageText(value) ? true : 'กรุณากรอกชื่อกลุ่ม'
                ),
            }),
            defineField({
              name: 'packages',
              title: 'แพ็กเกจในกลุ่ม',
              description:
                'เลือกแพ็กเกจจากข้อมูลกลางของโหมดนี้ และลากเพื่อจัดลำดับคอลัมน์',
              type: 'array',
              of: [
                {
                  type: 'reference',
                  to: [{ type: 'package' }],
                  options: packageReferenceOptions,
                },
              ],
              validation: (Rule) =>
                Rule.required()
                  .min(1)
                  .unique()
                  .custom((value, context) =>
                    validatePackageReferences(value, context, 'package')
                  ),
            }),
            defineField({
              name: 'rows',
              title: 'รายการเปรียบเทียบ',
              description:
                'เลือกสิ่งที่ต้องการเปรียบเทียบ และลากเพื่อเรียงแถว ใช้รายการเดียวกับกลุ่มอื่นหรือเลือกคนละชุดก็ได้',
              type: 'array',
              of: [
                {
                  type: 'reference',
                  to: [{ type: 'packageService' }],
                  options: packageReferenceOptions,
                },
              ],
              validation: (Rule) =>
                Rule.required()
                  .min(1)
                  .unique()
                  .custom((value, context) =>
                    validatePackageReferences(value, context, 'packageService')
                  ),
            }),
          ],
          preview: {
            select: { title: 'label.0.value', packages: 'packages' },
            prepare({ title, packages }) {
              return {
                title: title || 'กลุ่มแพ็กเกจ',
                subtitle: `${packages?.length ?? 0} แพ็กเกจ`,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'heading.heading.0.value', groups: 'groups' },
    prepare({ title, groups }) {
      return {
        title: title || 'Package Comparison',
        subtitle: `${groups?.length ?? 0} กลุ่มแพ็กเกจ`,
      };
    },
  },
});
