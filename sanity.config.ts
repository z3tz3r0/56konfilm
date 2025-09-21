'use client';
/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/sanity-cms/[[...tool]]/page.tsx` route
 */

import { languageFilter } from '@sanity/language-filter';
import { visionTool } from '@sanity/vision';
import { defineConfig, isKeySegment } from 'sanity';
import { internationalizedArray } from 'sanity-plugin-internationalized-array';
import { structureTool } from 'sanity/structure';

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './src/sanity/env';
import { schemaType } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';

export default defineConfig({
  basePath: '/sanity-cms',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema: schemaType,
  plugins: [
    structureTool({ structure }),
    internationalizedArray({
      languages: [
        { id: 'en', title: 'English' },
        { id: 'th', title: 'Thai' },
      ],
      defaultLanguages: ['en'],
      fieldTypes: ['string', 'text'],
    }),
    languageFilter({
      supportedLanguages: [
        { id: 'en', title: 'English' },
        { id: 'th', title: 'Thai' },
      ],
      defaultLanguages: ['en'],
      documentTypes: ['post', 'footer'],
      filterField: (enclosingType, member, selectedLanguageIds) => {
        // Filter internationalized arrays
        if (
          enclosingType.jsonType === 'object' &&
          enclosingType.name.startsWith('internationalizedArray') &&
          'kind' in member
        ) {
          // Get last two segments of the field's path
          const pathEnd = member.field.path.slice(-2);
          // If the second-last segment is a _key, and the last segment is `value`,
          // It's an internationalized array value
          // And the array _key is the language of the field
          const language =
            pathEnd[1] === 'value' && isKeySegment(pathEnd[0])
              ? pathEnd[0]._key
              : null;

          return language ? selectedLanguageIds.includes(language) : false;
        }

        // Filter internationalized objects if you have them
        // `localeString` must be registered as a custom schema type
        if (
          enclosingType.jsonType === 'object' &&
          enclosingType.name.startsWith('locale')
        ) {
          return selectedLanguageIds.includes(member.name);
        }

        return true;
      },
    }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
