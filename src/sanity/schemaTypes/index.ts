import { type SchemaTypeDefinition } from 'sanity';
import { localizedBlockType } from './objects/localized';
import { ctaType } from './objects/cta';
import { mediaBlockType } from './objects/mediaBlock';
import { cardItemType } from './objects/cardItem';
import { timelineStepType } from './objects/timelineStep';
import { galleryItemType } from './objects/galleryItem';
import { logoItemType } from './objects/logoItem';
import { socialMediaType } from './objects/socialMedia';
import { backgroundMediaType } from './objects/backgroundMedia';
import { pageType } from './page';
import { postType } from './postType';
import { projectType } from './projects';
import { heroSectionType } from './sections/heroSection';
import { twoColumnSectionType } from './sections/twoColumnSection';
import { cardCollectionSectionType } from './sections/cardCollectionSection';
import { timelineSectionType } from './sections/timelineSection';
import { mediaGallerySectionType } from './sections/mediaGallerySection';
import { logoGridSectionType } from './sections/logoGridSection';
import { ctaBannerSectionType } from './sections/ctaBannerSection';
import { settingsType } from './settings';

export const schemaType: { types: SchemaTypeDefinition[] } = {
  types: [
    postType,
    settingsType,
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
