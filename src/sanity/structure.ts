import { env } from '@shared/config';
import type {
  // StructureBuilder,
  StructureResolver,
} from 'sanity/structure';

// Helper to create a direct document link
// const pageItem = (
//   S: StructureBuilder,
//   title: string,
//   id: string,
//   schemaType: string = 'page'
// ) =>
//   S.documentListItem()
//     .id(id)
//     .title(title)
//     .schemaType(schemaType);

export const structure: StructureResolver = (S) =>
  S.list()
    .title('56KonFilm CMS')
    .items([
      S.listItem()
        .title('Global Settings')
        .id('settings')
        .child(S.document().schemaType('settings').documentId('settings')),
      S.divider(),

      // Production Pages (Flat)
      // S.listItem()
      //   .title('Production Pages')
      //   .id('production-pages')
      //   .child(
      //     S.list()
      //       .title('Production Mode')
      //       .items([
      //         pageItem(S, 'Home', 'production-home', 'productionPages'),
      //         pageItem(S, 'About Us', 'production-about'),
      //         pageItem(S, 'Contact Us', 'production-contact'),
      //         pageItem(S, 'Portfolio', 'production-portfolio'),
      //         pageItem(S, 'Services', 'production-services'),
      //       ])
      //   ),

      // Wedding Pages (Flat)
      // S.listItem()
      //   .title('Wedding Pages')
      //   .id('wedding-pages')
      //   .child(
      //     S.list()
      //       .title('Wedding Mode')
      //       .items([
      //         pageItem(S, 'Home', 'wedding-home', 'weddingPages'),
      //         pageItem(S, 'About Us', 'wedding-about'),
      //         pageItem(S, 'Contact Us', 'wedding-contact'),
      //         pageItem(S, 'Portfolio', 'wedding-portfolio'),
      //         pageItem(S, 'Services', 'wedding-services'),
      //       ])
      //   ),

      // S.divider(),

      // Other Types (Projects, Posts, etc.)
      // ...S.documentTypeListItems().filter(
      //   (item) =>
      //     ![
      //       'settings',
      //       'cmsCredentials',
      //       'page',
      //       'productionPages',
      //       'weddingPages',
      //     ].includes(item.getId() ?? '')
      // ),

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
      S.divider(),

      // System Pages (Admin Only)
      S.listItem()
        .title('Admin: All Pages')
        .child(
          S.documentList().title('System Pages').filter('_type == "page"')
        ),
    ]);
