import { Template } from 'sanity';
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
import { faqItemType } from './objects/faqItem';
import { statItemType } from './objects/statItem';
import { teamMemberType } from './objects/teamMember';
import { faqSectionType } from './sections/faqSection';
import { statsCounterSectionType } from './sections/statsCounterSection';
import { teamSectionType } from './sections/teamSection';
import { videoShowreelSectionType } from './sections/videoShowreelSection';
import { settingsType } from './settings';

export const schemaType = {
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
    statsCounterSectionType,
    teamSectionType,
    faqSectionType,
    videoShowreelSectionType,
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
    statItemType,
    teamMemberType,
    faqItemType,
    socialMediaType,
    seoObjectType,
  ],
  // บังคับค่า siteMode โดยตัดสินใจจาก document ที่ user กดสร้าง
  // จาก document 'Production Pages' หรือ 'Wedding Pages'?
  templates: (prev: Template[]) => {
    const defaultTemplate = [
      {
        id: 'production-pages',
        title: 'Production Pages',
        schemaType: 'page',
        value: {
          siteMode: 'production',
        },
      },
      {
        id: 'wedding-pages',
        title: 'Wedding Pages',
        schemaType: 'page',
        value: {
          siteMode: 'wedding',
        },
      },
    ];
    return [...prev, ...defaultTemplate];
  },
};
