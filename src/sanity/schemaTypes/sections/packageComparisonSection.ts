import { defineField, defineType } from 'sanity';
import {
  hasLocalizedPackageText,
  packageReferenceOptions,
  validatePackageReferences,
} from '../../lib/packageValidation';
import { localizedBlockType } from '../objects/localized';

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
      type: 'array',
      description:
        'เลือกกลุ่มของโหมดนี้ และลากเพื่อเรียงปุ่มเลือกกลุ่ม แพ็กเกจและรายการเปรียบเทียบมาจากข้อมูลของกลุ่มอัตโนมัติ',
      of: [
        {
          type: 'reference',
          to: [{ type: 'packageGroup' }],
          options: packageReferenceOptions,
        },
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .unique()
          .custom((value, context) =>
            validatePackageReferences(value, context, 'packageGroup')
          ),
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
