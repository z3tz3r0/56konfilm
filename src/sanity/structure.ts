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
          item.getId() !== 'page'
      ),
      S.divider(),

      // เมนู Production Pages (กรองเฉพาะ pages ที่มี siteMode เป็น production)
      S.listItem()
        .title('Production Pages')
        .id('production-pages')
        .child(
          S.documentList()
            .title('Production Pages')
            .filter('_type == "page" && siteMode == "production"')
            .apiVersion(env.NEXT_PUBLIC_SANITY_API_VERSION)
            .initialValueTemplates([
              S.initialValueTemplateItem('production-pages'),
            ])
        ),

      // เมนู Wedding Pages (กรองเฉพาะ pages ที่มี siteMode เป็น wedding)
      S.listItem()
        .title('Wedding Pages')
        .id('wedding-pages')
        .child(
          S.documentList()
            .title('Wedding Pages')
            .filter('_type == "page" && siteMode == "wedding"')
            .apiVersion(env.NEXT_PUBLIC_SANITY_API_VERSION)
            .initialValueTemplates([
              S.initialValueTemplateItem('wedding-pages'),
            ])
        ),
    ]);
