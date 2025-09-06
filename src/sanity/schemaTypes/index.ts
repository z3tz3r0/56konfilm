import { type SchemaTypeDefinition } from 'sanity';
import { heroSectionType } from './blocks/heroSection';
import { footerType } from './footerType';
import { pageType } from './page';
import { postType } from './postType';
import { projectType } from './projects';
import { settingsType } from './settings';

export const schemaType: { types: SchemaTypeDefinition[] } = {
  types: [
    postType,
    footerType,
    settingsType,
    projectType,
    pageType,
    heroSectionType,
  ],
};
