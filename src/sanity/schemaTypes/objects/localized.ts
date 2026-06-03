import { getParentSectionFromPath } from '@/sanity/lib/schemaHelpers';
import {
  defineField,
  defineType,
  FieldDefinitionBase,
  SchemaValidationValue,
  StringDefinition,
  TextDefinition,
} from 'sanity';

type LocalizedStringFieldConfig = Omit<
  StringDefinition,
  'type' | 'validation'
> & {
  group?: string | string[];
  validation?: SchemaValidationValue;
};
type LocalizedTextFieldConfig = Omit<TextDefinition, 'type' | 'validation'> & {
  group?: string | string[];
  validation?: SchemaValidationValue;
};
type LocalizedRichTextFieldConfig = Omit<
  FieldDefinitionBase,
  'type' | 'validation'
> & {
  name: string;
  title?: string;
  description?: string;
  group?: string | string[];
  validation?: SchemaValidationValue;
};

export const localizedStringField = (config: LocalizedStringFieldConfig) => {
  return defineField({ ...config, type: 'internationalizedArrayString' });
};

export const localizedTextField = (config: LocalizedTextFieldConfig) => {
  return defineField({ ...config, type: 'internationalizedArrayText' });
};

export const localizedRichTextField = (
  config: LocalizedRichTextFieldConfig
) => {
  return defineField({
    ...config,
    type: 'internationalizedArrayRichText',
  });
};

export const localizedBlockType = defineType({
  name: 'localizedBlock',
  title: 'Localized Block',
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'display', title: 'Display' },
  ],
  fields: [
    localizedStringField({
      name: 'eyebrow',
      title: 'Eyebrow',
      description: 'ข้อความเล็กๆ เหนือหัวข้อ',
      group: 'content',
      hidden: ({ document, path }) => {
        const currentSection = getParentSectionFromPath(document, path);
        const twoColumnSection = currentSection?._type === 'twoColumnSection';
        const isEmphasizedVariant =
          (currentSection?.sectionVariant || 'standard') === 'emphasized';
        return twoColumnSection && isEmphasizedVariant;
      },
    }),
    localizedStringField({
      name: 'heading',
      title: 'Heading',
      description:
        'หัวข้อหลัก (💡 ทริค: สามารถใช้เครื่องหมาย [ ] ครอบข้อความเพื่อแต้มสีได้ เช่น BEFORE [WE BECAME] WHO WE ARE — หมายเหตุ: ฟีเจอร์แต้มสีนี้จะแสดงผลเฉพาะในโหมด Production เท่านั้น)',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({
      name: 'body',
      title: 'Body',
      description: 'เนื้อหา',
      group: 'content',
    }),
    defineField({
      name: 'align',
      title: 'Text Align',
      description: 'การจัดตำแหน่งข้อความ',
      type: 'string',
      group: 'display',
      options: {
        list: [
          { title: 'Start', value: 'start' },
          { title: 'Center', value: 'center' },
          { title: 'End', value: 'end' },
        ],
        layout: 'radio',
      },
      initialValue: 'start',
    }),
  ],
  preview: {
    select: { heading: 'heading.0.value', eyebrow: 'eyebrow.0.value' },
    prepare({ heading, eyebrow }) {
      return { title: heading || 'Localized Block', subtitle: eyebrow || '' };
    },
  },
});
