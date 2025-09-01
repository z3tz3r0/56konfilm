import { defineField, defineType } from 'sanity';

export const footerType = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'companyTitle',
      title: 'Company Title',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contactTitle',
      title: 'Contact Title',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contacts',
      title: 'Contacts',
      type: 'internationalizedArrayText',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'socialMediaTitle',
      title: 'Social Media Title',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required(),
    }),
  ],
});
