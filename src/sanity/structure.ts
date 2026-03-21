import type {
  StructureBuilder,
  StructureResolver,
} from 'sanity/structure';

// Helper to create a direct document link
const pageItem = (
  S: StructureBuilder,
  title: string,
  id: string,
  schemaType: string = 'page'
) =>
  S.documentListItem()
    .id(id)
    .title(title)
    .schemaType(schemaType);

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Global Settings')
        .id('settings')
        .child(S.document().schemaType('settings').documentId('settings')),
      S.divider(),

      // Production Pages (Flat)
      S.listItem()
        .title('Production Pages')
        .id('production-pages')
        .child(
          S.list()
            .title('Production Mode')
            .items([
              pageItem(S, 'Home', 'production-home', 'productionPages'),
              pageItem(S, 'About Us', 'production-about'),
              pageItem(S, 'Contact Us', 'production-contact'),
              pageItem(S, 'Portfolio', 'production-portfolio'),
              pageItem(S, 'Services', 'production-services'),
            ])
        ),

      // Wedding Pages (Flat)
      S.listItem()
        .title('Wedding Pages')
        .id('wedding-pages')
        .child(
          S.list()
            .title('Wedding Mode')
            .items([
              pageItem(S, 'Home', 'wedding-home', 'weddingPages'),
              pageItem(S, 'About Us', 'wedding-about'),
              pageItem(S, 'Contact Us', 'wedding-contact'),
              pageItem(S, 'Portfolio', 'wedding-portfolio'),
              pageItem(S, 'Services', 'wedding-services'),
            ])
        ),

      S.divider(),

      // Other Types (Projects, Posts, etc.)
      ...S.documentTypeListItems().filter(
        (item) =>
          ![
            'settings',
            'cmsCredentials',
            'page',
            'productionPages',
            'weddingPages',
          ].includes(item.getId() ?? '')
      ),

      S.divider(),

      // System Pages (Admin Only)
      S.listItem()
        .title('Admin: All Pages')
        .child(S.documentList().title('System Pages').filter('_type == "page"')),
    ]);
