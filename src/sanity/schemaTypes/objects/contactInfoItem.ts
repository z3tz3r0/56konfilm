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
      description: 'ค่าของช่องทางติดต่อ (เช่น hello@56kon.com)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      description:
        'ชื่อ Lucide icon (Mail, Phone, MapPin, MessageCircle, Instagram, etc.)',
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
      value: 'value',
    },
    prepare({ title, icon, value }) {
      return {
        title: title || 'Contact Channel',
        subtitle: `${icon ?? ''}  ${value ?? ''}`.trim(),
      };
    },
  },
});
