import { defineField, defineType } from 'sanity';
import {
  hasLocalizedPackageText,
  packageReferenceOptions,
  validatePackageReferences,
  validateRecapHighlights,
} from '../lib/packageValidation';
import { ctaType } from './objects/cta';
import { localizedStringField } from './objects/localized';

export const packageType = defineType({
  name: 'package',
  title: 'Package',
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
            : 'กรุณาสร้างแพ็กเกจผ่านเมนู Production หรือ Wedding'
        ),
    }),
    localizedStringField({
      name: 'title',
      title: 'ชื่อแพ็กเกจ',
      validation: (Rule) =>
        Rule.required().custom((value) =>
          hasLocalizedPackageText(value) ? true : 'กรุณากรอกชื่อแพ็กเกจ'
        ),
    }),
    defineField({
      name: 'price',
      title: 'ราคา',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'สกุลเงิน',
      type: 'string',
      initialValue: 'THB',
      validation: (Rule) =>
        Rule.required().custom((value) =>
          typeof value === 'string' && value.trim() ? true : 'กรุณากรอกสกุลเงิน'
        ),
    }),
    defineField({
      name: 'cta',
      title: 'ปุ่มของแพ็กเกจ',
      description:
        'กำหนดข้อความ รูปแบบ และปลายทางของปุ่ม ใช้ร่วมกันใน section ที่เลือกแพ็กเกจนี้',
      type: ctaType.name,
      validation: (Rule) =>
        Rule.required().custom((value) =>
          hasLocalizedPackageText(
            (value as { label?: unknown } | undefined)?.label
          )
            ? true
            : 'กรุณากรอกข้อความบนปุ่มของแพ็กเกจ'
        ),
    }),
    localizedStringField({
      name: 'badgeLabel',
      title: 'ข้อความป้ายกำกับ',
      description:
        'เช่น Most Popular แสดงเหนือชื่อแพ็กเกจในตารางเปรียบเทียบ เว้นว่างได้',
    }),
    defineField({
      name: 'services',
      title: 'สิ่งที่รวมในแพ็กเกจ',
      description:
        'เลือกทุกรายการที่แพ็กเกจนี้มี ตารางจะแสดงเครื่องหมายถูกให้ และลากเพื่อเรียงลำดับได้ สร้างรายการใหม่ได้จากเมนูสิ่งที่รวมในแพ็กเกจของโหมดนี้',
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
    defineField({
      name: 'recapHighlights',
      title: 'รายการเด่นสำหรับการ์ดแพ็กเกจ',
      description:
        'เลือกจากสิ่งที่รวมในแพ็กเกจนี้ และลากเพื่อเรียงลำดับ หากเว้นว่าง การ์ดจะแสดงสามรายการแรกของแพ็กเกจ หรือเท่าที่มี',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'packageService' }],
          options: {
            disableNew: true,
            filter: ({ document }) => ({
              filter: 'siteMode == $mode && _id in $ids',
              params: {
                mode: document.siteMode ?? '',
                ids: Array.isArray(document.services)
                  ? document.services.map((item) => item._ref)
                  : [],
              },
            }),
          },
        },
      ],
      validation: (Rule) =>
        Rule.unique().custom((value, context) =>
          validateRecapHighlights(value, context.document?.services)
        ),
    }),
  ],
  preview: {
    select: {
      title: 'title.0.value',
      price: 'price',
      currency: 'currency',
      mode: 'siteMode',
    },
    prepare({ title, price, currency, mode }) {
      return {
        title: title || 'Package',
        subtitle: `${mode} · ${price ?? ''} ${currency ?? ''}`,
      };
    },
  },
});
