import { defineField, defineType } from 'sanity';
import {
    ImageAssetValue,
    SanityValidationContext,
    validateImageAssetSizeWarning,
} from './backgroundMedia';
import { localizedStringField } from './localized';

export const mediaBlockType = defineType({
  name: 'mediaBlock',
  title: 'Media',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      description: 'รูปภาพ',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.required().custom((value, context) =>
          validateImageAssetSizeWarning(
            value as ImageAssetValue | undefined,
            context as SanityValidationContext
          )
        ).warning(),
    }),
    localizedStringField({ name: 'alt', title: 'Alt Text', description: 'ข้อความอธิบายรูปภาพ' }),
  ],
});
