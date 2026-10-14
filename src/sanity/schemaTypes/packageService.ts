import { defineField, defineType } from 'sanity';
import {
  hasLocalizedPackageText,
  packageReferenceOptions,
  validatePackageReferences,
} from '../lib/packageValidation';
import { PackageServicePackagesInput } from '../components/inputs/PackageServicePackagesInput';
import { localizedStringField, localizedTextField } from './objects/localized';

export const packageServiceType = defineType({
  name: 'packageService',
  title: 'สิ่งที่รวมในแพ็กเกจ',
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
            : 'กรุณาสร้างรายการผ่านเมนู Production หรือ Wedding'
        ),
    }),
    localizedStringField({
      name: 'title',
      title: 'ชื่อรายการ',
      description:
        'เช่น ช่างภาพ วิดีโอไฮไลต์ หรือการถ่ายโดรน ใช้ทั้งในการ์ดและตารางแพ็กเกจ',
      validation: (Rule) =>
        Rule.required().custom((value) =>
          hasLocalizedPackageText(value) ? true : 'กรุณากรอกชื่อรายการ'
        ),
    }),
    localizedTextField({
      name: 'information',
      title: 'คำอธิบายเพิ่มเติม',
      description:
        'แสดงเมื่อผู้ชมชี้หรือกดไอคอนข้อมูลข้างชื่อรายการ หากไม่ต้องการแสดงไอคอน ให้เว้นว่าง',
    }),
    defineField({
      name: 'packages',
      title: 'แพ็กเกจที่รวมบริการนี้',
      type: 'array',
      description:
        'ติ๊กแพ็กเกจที่มีบริการนี้ เลือกอย่างน้อยหนึ่งแพ็กเกจก่อนเผยแพร่ ตัวเลือกแสดงเฉพาะแพ็กเกจที่เผยแพร่แล้วของโหมดนี้',
      components: { input: PackageServicePackagesInput },
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
  ],
  // Membership is authored here only; groups and cards derive it by ID.
  preview: {
    select: { title: 'title.0.value', mode: 'siteMode' },
    prepare({ title, mode }) {
      return { title: title || 'สิ่งที่รวมในแพ็กเกจ', subtitle: mode };
    },
  },
});
