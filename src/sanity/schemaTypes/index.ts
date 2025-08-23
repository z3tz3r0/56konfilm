import { type SchemaTypeDefinition } from 'sanity';
import { postType } from './postType';

export const schemaType: { types: SchemaTypeDefinition[] } = {
  types: [postType],
};
