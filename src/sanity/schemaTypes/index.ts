import { type SchemaTypeDefinition } from 'sanity';
import { footerType } from './footerType';
import { postType } from './postType';

export const schemaType: { types: SchemaTypeDefinition[] } = {
  types: [postType, footerType],
};
