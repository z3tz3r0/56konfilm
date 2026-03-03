import { createPageSchema } from '@/sanity/lib/sanityUtils';

export const weddingType = createPageSchema({
  name: 'weddingPages',
  title: 'Wedding Pages',
  siteMode: 'wedding',
  contentBlocksName: 'weddingSections',
  contentBlocksTitle: 'Wedding Sections',
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
