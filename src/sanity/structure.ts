import { env } from '@shared/config';
import type { StructureResolver } from 'sanity/structure';

/** Builds the Studio navigation with separate catalog lists and creation templates for each site mode. */
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
          item.getId() !== 'projectTag' &&
          item.getId() !== 'package' &&
          item.getId() !== 'packageService' &&
          item.getId() !== 'packageGroup'
      ),
      S.divider(),

      ...(['package', 'packageService', 'packageGroup'] as const).map(
        (type) => {
          const title =
            type === 'package'
              ? 'Packages'
              : type === 'packageService'
                ? 'Package Services'
                : 'Package Groups';
          const template =
            type === 'package'
              ? 'production-packages'
              : type === 'packageService'
                ? 'production-package-services'
                : 'production-package-groups';
          return S.listItem()
            .title(`Production — ${title}`)
            .id(template)
            .child(
              S.documentList()
                .title(`Production — ${title}`)
                .filter('_type == $type && siteMode == "production"')
                .params({ type })
                .apiVersion(env.NEXT_PUBLIC_SANITY_API_VERSION)
                .initialValueTemplates([S.initialValueTemplateItem(template)])
            );
        }
      ),
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

      ...(['package', 'packageService', 'packageGroup'] as const).map(
        (type) => {
          const title =
            type === 'package'
              ? 'Packages'
              : type === 'packageService'
                ? 'Package Services'
                : 'Package Groups';
          const template =
            type === 'package'
              ? 'wedding-packages'
              : type === 'packageService'
                ? 'wedding-package-services'
                : 'wedding-package-groups';
          return S.listItem()
            .title(`Wedding — ${title}`)
            .id(template)
            .child(
              S.documentList()
                .title(`Wedding — ${title}`)
                .filter('_type == $type && siteMode == "wedding"')
                .params({ type })
                .apiVersion(env.NEXT_PUBLIC_SANITY_API_VERSION)
                .initialValueTemplates([S.initialValueTemplateItem(template)])
            );
        }
      ),
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
