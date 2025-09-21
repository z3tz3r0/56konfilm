import { defineField, defineType, Rule } from 'sanity';

type BaseFieldConfig = {
  name: string;
  title: string;
  description?: string;
  group?: string | string[];
  options?: Record<string, unknown>;
  hidden?: boolean | ((arg: unknown) => boolean);
  validation?: (rule: Rule) => Rule;
};

export const localizedStringField = (config: BaseFieldConfig) => {
  return defineField({ ...config, type: 'internationalizedArrayString' });
};

export const localizedTextField = (config: BaseFieldConfig) => {
  return defineField({ ...config, type: 'internationalizedArrayText' });
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
    localizedStringField({ name: 'eyebrow', title: 'Eyebrow' }),
    localizedStringField({
      name: 'heading',
      title: 'Heading',
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField({ name: 'body', title: 'Body', group: 'content' }),
    defineField({
      name: 'align',
      title: 'Text Align',
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
