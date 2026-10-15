import { defineField, defineType, getPublishedId } from 'sanity';
import {
  hasLocalizedPackageText,
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
      name: 'recapHighlights',
      title: 'รายการเด่นสำหรับการ์ดแพ็กเกจ',
      description:
        'เลือกบริการที่เชื่อมกับแพ็กเกจนี้ และลากเพื่อเรียงรายการบนการ์ด หากเว้นว่าง จะใช้สามบริการแรกตามวันที่สร้าง หรือเท่าที่มี',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'packageService' }],
          options: {
            disableNew: true,
            filter: ({ document }) => ({
              filter:
                'siteMode == $mode && $packageId in packages[]._ref && !(_id in path("drafts.**")) && !(_id in path("versions.**"))',
              params: {
                mode: document.siteMode ?? '',
                packageId: getPublishedId(document._id),
              },
            }),
          },
        },
      ],
      validation: (Rule) =>
        Rule.unique().custom((value, context) =>
          validateRecapHighlights(value, context)
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
