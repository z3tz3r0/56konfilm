import { type SchemaTypeDefinition } from 'sanity';
import { cmsCredentialsType } from './cmsCredentials';
import { backgroundMediaType } from './objects/backgroundMedia';
import { cardItemType } from './objects/cardItem';
import { ctaType } from './objects/cta';
import { galleryItemType } from './objects/galleryItem';
import { packageItemType } from './objects/packageItem';
import { testimonialItemType } from './objects/testimonialItem';
import { localizedBlockType } from './objects/localized';
import { logoItemType } from './objects/logoItem';
import { mediaBlockType } from './objects/mediaBlock';
import { seoObjectType } from './objects/seo';
import { socialMediaType } from './objects/socialMedia';
import { timelineStepType } from './objects/timelineStep';
import { pageType } from './page';
import { postType } from './postType';
import { projectType } from './projects';
import { cardCollectionSectionType } from './sections/cardCollectionSection';
import { ctaBannerSectionType } from './sections/ctaBannerSection';
import { heroSectionType } from './sections/heroSection';
import { logoGridSectionType } from './sections/logoGridSection';
import { mediaGallerySectionType } from './sections/mediaGallerySection';
import { packagesSectionType } from './sections/packagesSection';
import { philosophySectionType } from './sections/philosophySection';
import { testimonialSectionType } from './sections/testimonialSection';
import { timelineSectionType } from './sections/timelineSection';
import { twoColumnSectionType } from './sections/twoColumnSection';
import { settingsType } from './settings';

export const schemaType: { types: SchemaTypeDefinition[] } = {
  types: [
    postType,
    settingsType,
    cmsCredentialsType, // Hidden from Studio UI but registered for API access
    projectType,
    pageType,
    heroSectionType,
    twoColumnSectionType,
    cardCollectionSectionType,
    timelineSectionType,
    mediaGallerySectionType,
    packagesSectionType,
    philosophySectionType,
    testimonialSectionType,
    logoGridSectionType,
    ctaBannerSectionType,
    localizedBlockType,
    ctaType,
    mediaBlockType,
    backgroundMediaType,
    cardItemType,
    packageItemType,
    testimonialItemType,
    timelineStepType,
    galleryItemType,
    logoItemType,
    socialMediaType,
    seoObjectType,
  ],
};
