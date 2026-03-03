import { createPageSchema } from '@/sanity/lib/sanityUtils';

export const productionType = createPageSchema({
  name: 'productionPages',
  title: 'Production Pages',
  siteMode: 'production',
  contentBlocksName: 'commercialSections',
  contentBlocksTitle: 'Commercial Sections',
  allowedSections: [
    'heroSection',
    'twoColumnSection',
    'cardCollectionSection',
    'timelineSection',
    'mediaGallerySection',
    'logoGridSection',
    'ctaBannerSection',
    'packagesSection',
    'testimonialSection',
    'philosophySection',
  ],
});
