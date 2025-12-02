import { defineField, defineType } from 'sanity';

export const cmsCredentialsType = defineType({
  name: 'cmsCredentials',
  title: 'CMS Credentials',
  type: 'document',
  // Hidden from Studio structure (configured in structure.ts)
  fields: [
    defineField({
      name: 'username',
      title: 'Username',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'password',
      title: 'Password Hash',
      type: 'string',
      validation: (rule) => rule.required(),
      // Hidden from Studio UI
      readOnly: true,
      description: 'Stores bcrypt hashed password (not plain text)',
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
});
