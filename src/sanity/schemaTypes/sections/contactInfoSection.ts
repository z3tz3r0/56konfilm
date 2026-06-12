import { defineField, defineType, defineArrayMember } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons';
import { localizedBlockType } from '../objects/localized';
import { contactInfoItemType } from '../objects/contactInfoItem';

export const contactInfoSectionType = defineType({
  name: 'contactInfoSection',
  title: 'Contact Info Section',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'หัวข้อส่วน Contact',
      type: localizedBlockType.name,
    }),
    defineField({
      name: 'channels',
      title: 'Contact Channels',
      description: 'ช่องทางการติดต่อ (แนะนำ 2-4 ช่องทาง)',
      type: 'array',
      of: [defineArrayMember({ type: contactInfoItemType.name })],
      validation: (Rule) => Rule.min(1).max(6),
    }),
    defineField({
      name: 'showForm',
      title: 'Show Contact Form',
      description: 'แสดงฟอร์มติดต่อด้านล่างการ์ด',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'background',
      title: 'Background',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Muted', value: 'muted' },
          { title: 'Contrast', value: 'contrast' },
        ],
        layout: 'radio',
      },
      initialValue: 'default',
    }),
  ],
  preview: {
    select: {
      title: 'heading.heading.0.value',
      channels: 'channels',
      showForm: 'showForm',
    },
    prepare({ title, channels, showForm }) {
      const count = Array.isArray(channels) ? channels.length : 0;
      return {
        title: title || 'Contact Info Section',
        subtitle: `${count} channel${count === 1 ? '' : 's'}${showForm ? ' · with form' : ''}`,
      };
    },
  },
});
