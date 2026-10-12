import { defineField, defineType } from 'sanity';
import { hasLocalizedPackageText } from '../lib/packageValidation';
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
  ],
  preview: {
    select: { title: 'title.0.value', mode: 'siteMode' },
    prepare({ title, mode }) {
      return { title: title || 'สิ่งที่รวมในแพ็กเกจ', subtitle: mode };
    },
  },
});
