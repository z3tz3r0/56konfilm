import { defineField, defineType } from 'sanity';
import {
  hasLocalizedPackageText,
  packageReferenceOptions,
  validatePackageReferences,
} from '../lib/packageValidation';
import { PackageGroupServiceOrderInput } from '../components/inputs/PackageGroupServiceOrderInput';
import { localizedStringField } from './objects/localized';

/** Reusable within one mode only; availability remains owned by Services. */
export const packageGroupType = defineType({
  name: 'packageGroup',
  title: 'Package Group',
  type: 'document',
  fields: [
    defineField({
      name: 'siteMode',
      type: 'string',
      hidden: true,
      readOnly: true,
      options: { list: ['production', 'wedding'] },
      validation: (Rule) =>
        Rule.required().custom((value) =>
          value === 'production' || value === 'wedding'
            ? true
            : 'กรุณาสร้างกลุ่มผ่านเมนู Production หรือ Wedding'
        ),
    }),
    localizedStringField({
      name: 'label',
      title: 'ชื่อกลุ่ม',
      description:
        'เช่น Budget Friendly หรือ Most Popular ใช้เป็นชื่อกลุ่มที่ผู้ชมเลือกสลับ',
      validation: (Rule) =>
        Rule.required().custom((value) =>
          hasLocalizedPackageText(value) ? true : 'กรุณากรอกชื่อกลุ่ม'
        ),
    }),
    defineField({
      name: 'packages',
      title: 'แพ็กเกจในกลุ่ม',
      type: 'array',
      description: 'เลือกแพ็กเกจของโหมดนี้ และลากเพื่อเรียงคอลัมน์จากซ้ายไปขวา',
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
      name: 'serviceOrder',
      title: 'รายการเปรียบเทียบ — ลากเพื่อจัดลำดับ',
      type: 'array',
      components: { input: PackageGroupServiceOrderInput },
      description:
        'รายการมาจากบริการของแพ็กเกจในกลุ่มอัตโนมัติ ลากเพื่อเรียงแถว จากนั้นกด Publish เพื่อให้หน้าเว็บใช้ลำดับใหม่',
      of: [{ type: 'reference', to: [{ type: 'packageService' }], weak: true }],
      validation: (Rule) => Rule.unique(),
    }),
  ],
  preview: {
    select: { title: 'label.0.value', mode: 'siteMode', packages: 'packages' },
    prepare({ title, mode, packages }) {
      return {
        title: title || 'กลุ่มแพ็กเกจ',
        subtitle: `${mode} · ${packages?.length ?? 0} แพ็กเกจ`,
      };
    },
  },
});
