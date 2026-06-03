import { ImageIcon } from '@sanity/icons';
import { defineType, defineArrayMember } from 'sanity';

export const richTextType = defineType({
  name: 'richText',
  title: 'Rich Text Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
    }),
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
    }),
  ],
});
