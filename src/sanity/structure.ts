import { env } from '@shared/config';
import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('56KonFilm CMS')
    .items([
      S.listItem()
        .title('Global Settings')
        .id('settings')
        .child(S.document().schemaType('settings').documentId('settings')),
      S.divider(),

      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() !== 'settings' &&
          item.getId() !== 'cmsCredentials' &&
          item.getId() !== 'page' &&
          item.getId() !== 'projectTag'
      ),
      S.divider(),

      S.listItem()
        .title('Production — Project Tags')
        .id('production-project-tags')
        .child(
          S.documentList()
            .title('Production — Project Tags')
            .filter('_type == "projectTag" && siteMode == "production"')
            .apiVersion(env.NEXT_PUBLIC_SANITY_API_VERSION)
            .initialValueTemplates([
              S.initialValueTemplateItem('production-project-tags'),
            ])
        ),
      S.listItem()
        .title('Production — Pages')
        .id('production-pages')
        .child(
          S.documentList()
            .title('Production — Pages')
            .filter('_type == "page" && siteMode == "production"')
            .apiVersion(env.NEXT_PUBLIC_SANITY_API_VERSION)
            .initialValueTemplates([
              S.initialValueTemplateItem('production-pages'),
            ])
        ),
      S.divider(),

      S.listItem()
        .title('Wedding — Project Tags')
        .id('wedding-project-tags')
        .child(
          S.documentList()
            .title('Wedding — Project Tags')
            .filter('_type == "projectTag" && siteMode == "wedding"')
            .apiVersion(env.NEXT_PUBLIC_SANITY_API_VERSION)
            .initialValueTemplates([
              S.initialValueTemplateItem('wedding-project-tags'),
            ])
        ),
      S.listItem()
        .title('Wedding — Pages')
        .id('wedding-pages')
        .child(
          S.documentList()
            .title('Wedding — Pages')
            .filter('_type == "page" && siteMode == "wedding"')
            .apiVersion(env.NEXT_PUBLIC_SANITY_API_VERSION)
            .initialValueTemplates([
              S.initialValueTemplateItem('wedding-pages'),
            ])
        ),
    ]);
