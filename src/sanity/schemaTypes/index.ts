import { type SchemaTypeDefinition } from 'sanity';
import { cmsCredentialsType } from './cmsCredentials';
import { backgroundMediaType } from './objects/backgroundMedia';
import { cardItemType } from './objects/cardItem';
import { ctaType } from './objects/cta';
import { galleryItemType } from './objects/galleryItem';
import { localizedBlockType } from './objects/localized';
import { logoItemType } from './objects/logoItem';
import { mediaBlockType } from './objects/mediaBlock';
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
    logoGridSectionType,
    ctaBannerSectionType,
    localizedBlockType,
    ctaType,
    mediaBlockType,
    backgroundMediaType,
    cardItemType,
    timelineStepType,
    galleryItemType,
    logoItemType,
    socialMediaType,
  ],
};
