import { defineField, defineType } from 'sanity';
import { localizedStringField } from './localized';

export const contactInfoItemType = defineType({
  name: 'contactInfoItem',
  title: 'Contact Channel',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'label',
      title: 'Label',
      description: 'ชื่อช่องทาง (เช่น Email, Phone, Location)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      description:
        'ค่าของช่องทางติดต่อ (เช่น อีเมล เบอร์โทร หรือที่อยู่) กด Enter เพื่อขึ้นบรรทัดใหม่',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'iconPicker',
      title: 'Icon',
      description:
        'เลือกไอคอนแบบเดียวกับ Card Collection หากยังไม่เลือกจะใช้ Legacy Icon เดิม',
      type: 'icon',
    }),
    defineField({
      name: 'icon',
      title: 'Legacy Icon',
      description:
        'ชื่อ Lucide icon เดิม (Mail, Phone, MapPin ฯลฯ) ใช้เมื่อยังไม่ได้เลือก Icon ด้านบน',
      type: 'string',
      initialValue: 'Mail',
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      description: 'URL ลิงก์ (เช่น mailto:, tel:, https:// — ไม่จำเป็น)',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          allowRelative: false,
          scheme: ['http', 'https', 'mailto', 'tel'],
        }),
    }),
  ],
  preview: {
    select: {
      title: 'label.0.value',
      icon: 'icon',
      iconName: 'iconPicker.name',
      value: 'value',
    },
    prepare({ title, icon, iconName, value }) {
      return {
        title: title || 'Contact Channel',
        subtitle: `${iconName || icon || ''}  ${value ?? ''}`.trim(),
      };
    },
  },
});
