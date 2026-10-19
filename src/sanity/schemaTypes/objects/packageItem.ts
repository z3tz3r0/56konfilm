import { defineField, defineType } from 'sanity';
import { localizedStringField } from './localized';
import { ctaType } from './cta';

export const packageItemType = defineType({
  name: 'packageItem',
  title: 'Package Item',
  type: 'object',
  fields: [
    localizedStringField({
      name: 'title',
      title: 'Title',
      description: 'ชื่อแพ็กเกจ',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      description: 'ราคาแพ็กเกจ',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      description: 'สกุลเงิน',
      type: 'string',
      initialValue: 'THB',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'features',
      title: 'Features',
      description: 'รายการคุณสมบัติของแพ็กเกจ',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'featured',
      title: 'Highlight',
      description: 'ไฮไลต์แพ็กเกจนี้',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'cta',
      title: 'CTA',
      description: 'ปุ่ม CTA ของแพ็กเกจ',
      type: ctaType.name,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      price: 'price',
      currency: 'currency',
      features: 'features',
      featured: 'featured',
    },
    /** Summarize the first nonblank localized name, price, details count, and Highlight status. */
    prepare({ title, price, currency, features, featured }) {
      const packageTitle = Array.isArray(title)
        ? title
            .find(
              (translation) =>
                typeof translation?.value === 'string' &&
                translation.value.trim()
            )
            ?.value.trim()
        : undefined;
      const priceLabel =
        typeof price === 'number' && Number.isFinite(price)
          ? price.toLocaleString('en-US', { maximumFractionDigits: 20 })
          : 'ยังไม่ระบุราคา';
      const currencyLabel = typeof currency === 'string' ? currency.trim() : '';
      const featureCount = Array.isArray(features)
        ? features.filter(
            (feature) => typeof feature === 'string' && feature.trim()
          ).length
        : 0;

      return {
        title: packageTitle || 'ยังไม่ระบุชื่อแพ็กเกจ',
        subtitle: [
          [priceLabel, currencyLabel].filter(Boolean).join(' '),
          `${featureCount} รายการ`,
          featured === true ? 'Highlight' : null,
        ]
          .filter(Boolean)
          .join(' · '),
      };
    },
  },
});
