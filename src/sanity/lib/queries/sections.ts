import { groq } from 'next-sanity';
import {
  CTA_PROJECTION,
  IMAGE_PROJECTION,
  LOCALIZED,
  MEDIA_ASSET_PROJECTION,
  PROJECT_PROJECTION,
} from './fragments';

const HERO_SECTION = groq`
  _type == "heroSection" => {
    "title": ${LOCALIZED('title')},
    "enableRotatingText": coalesce(enableRotatingText, false),
    "rotatingWords": rotatingWords[]{ "word": coalesce(@[$lang], en) }[defined(word)].word,
    "tagline": ${LOCALIZED('tagline')},
    "parallaxText": ${LOCALIZED('parallaxText')},
    "shapeDivider": coalesce(shapeDivider, false),
    "backgroundMedia": backgroundMedia.mediaAsset[]{
      ${MEDIA_ASSET_PROJECTION}
    },
    ctas[]{
      ${CTA_PROJECTION}
    }
  }
`;

const TWO_COLUMN_SECTION = groq`
  _type == "twoColumnSection" => {
    layout,
    "sectionVariant": coalesce(sectionVariant, 'standard'),
    background,
    heading{
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    media{
      ${IMAGE_PROJECTION}
    },
    ctas[]{
      ${CTA_PROJECTION}
    }
  }
`;

const CARD_COLLECTION_SECTION = groq`
  _type == "cardCollectionSection" => {
    "layoutVariant": coalesce(layoutVariant, 'standard'),
    "title": ${LOCALIZED('title')},
    "intro": ${LOCALIZED('intro')},
    "hasButton": coalesce(hasButton, false),
    ctaButton { ${CTA_PROJECTION} },
    columns,
    background,
    "hasIcon": coalesce(hasIcon, false),
    cards[]{
      "title": ${LOCALIZED('title')},
      "body": ${LOCALIZED('body')},
      icon,
      bgImage { asset, crop, hotspot },
    }
  }
`;

const TIMELINE_SECTION = groq`
  _type == "timelineSection" => {
    background,
    heading{
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    steps[]{
      order,
      "title": ${LOCALIZED('title')},
      "description": ${LOCALIZED('description')},
      icon{ asset, crop, hotspot }
    } | order(order asc),
    cta{
      ${CTA_PROJECTION}
    }
  }
`;

const MEDIA_GALLERY_SECTION = groq`
  _type == "mediaGallerySection" => {
    background,
    sourceType,
    heading{
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    "items": select(
      sourceType == "projects" => selectedProjects[]->{
        "_key": _id,
        "mediaType": "image",
        "media": {
          "image": coverImage{
            asset,
            crop,
            hotspot
          },
          "alt": ${LOCALIZED('title')}
        },
        "label": ${LOCALIZED('title')},
        "projectSlug": slug.current,
        "projectOverview": ${LOCALIZED('overview')}
      }[0...6],
      items[]{
        _key,
        mediaType,
        media{
          ${IMAGE_PROJECTION}
        },
        "videoUrl": videoFile.asset->url,
        "label": ${LOCALIZED('label')}
      }
    ),
    cta{
      ${CTA_PROJECTION}
    }
  }
`;

const LOGO_GRID_SECTION = groq`
  _type == "logoGridSection" => {
    background,
    "title": ${LOCALIZED('title')},
    logos[]{
      ${IMAGE_PROJECTION}
    }
  }
`;

const CTA_BANNER_SECTION = groq`
  _type == "ctaBannerSection" => {
    background,
    layout,
    content{
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    media{
      ${IMAGE_PROJECTION}
    },
    ctas[]{
      ${CTA_PROJECTION}
    },
    customColors{
      eyebrow,
      heading,
      body
    },
    overlay{
      enabled,
      color,
      opacity
    }
  }
`;

const PACKAGES_SECTION = groq`
  _type == "packagesSection" => {
    heading{
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    packages[]{
      "title": ${LOCALIZED('title')},
      price,
      currency,
      features,
      featured,
      cta{
        ${CTA_PROJECTION}
      }
    },
    background
  }
`;

const TESTIMONIAL_SECTION = groq`
  _type == "testimonialSection" => {
    heading{
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    testimonials[]{
      "quote": ${LOCALIZED('quote')},
      authorName,
      authorTitle,
      authorImage{ asset, crop, hotspot }
    },
    background
  }
`;

const PHILOSOPHY_SECTION = groq`
  _type == "philosophySection" => {
    "quote": ${LOCALIZED('quote')},
    background
  }
`;

const STATS_COUNTER_SECTION = groq`
  _type == "statsCounterSection" => {
    background,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    stats[] {
      _key,
      value,
      suffix,
      "label": ${LOCALIZED('label')}
    }
  }
`;

const TEAM_SECTION = groq`
  _type == "teamSection" => {
    background,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    members[] {
      _key,
      name,
      "role": ${LOCALIZED('role')},
      "bio": ${LOCALIZED('bio')},
      image {
        asset,
        crop,
        hotspot
      }
    }
  }
`;

const FAQ_SECTION = groq`
  _type == "faqSection" => {
    background,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    items[] {
      _key,
      "question": ${LOCALIZED('question')},
      "answer": ${LOCALIZED('answer')}
    }
  }
`;

const VIDEO_SHOWREEL_SECTION = groq`
  _type == "videoShowreelSection" => {
    background,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    videoUrl,
    thumbnail {
      asset,
      crop,
      hotspot
    },
    "caption": ${LOCALIZED('caption')}
  }
`;

const FEATURED_PROJECT_SECTION = groq`
  heading {
    "eyebrow": ${LOCALIZED('eyebrow')},
    "heading": ${LOCALIZED('heading')},
    "body": ${LOCALIZED('body')},
    align
  },
  sourceType,
  selectedProjects[]->{ ${PROJECT_PROJECTION} },
  ctaButton { ${CTA_PROJECTION} },
  background
`;

export const PROCESS_SECTION = groq`
  _type == "processSection" => {
    background,
    layout,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    steps[] {
      _key,
      stepNumber,
      "title": ${LOCALIZED('title')},
      "description": ${LOCALIZED('description')},
      icon
    } | order(stepNumber asc)
  }
`;

export const AWARDS_SECTION = groq`
  _type == "awardsSection" => {
    background,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    awards[] {
      _key,
      "name": ${LOCALIZED('name')},
      "event": ${LOCALIZED('event')},
      year,
      logo { asset, crop, hotspot }
    }
  }
`;

export const CONTACT_INFO_SECTION = groq`
  _type == "contactInfoSection" => {
    background,
    showForm,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    channels[] {
      _key,
      "label": ${LOCALIZED('label')},
      value,
      icon,
      linkUrl
    }
  }
`;

export const BLOG_PREVIEW_SECTION = groq`
  _type == "blogPreviewSection" => {
    background,
    maxPosts,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    cta {
      ${CTA_PROJECTION}
    }
  }
`;

export const CAPABILITIES_SECTION = groq`
  _type == "capabilitiesSection" => {
    background,
    layout,
    heading {
      "eyebrow": ${LOCALIZED('eyebrow')},
      "heading": ${LOCALIZED('heading')},
      "body": ${LOCALIZED('body')},
      align
    },
    features[] {
      _key,
      "title": ${LOCALIZED('title')},
      "description": ${LOCALIZED('description')},
      icon,
      image { asset, crop, hotspot }
    }
  }
`;
export {
  HERO_SECTION,
  TWO_COLUMN_SECTION,
  CARD_COLLECTION_SECTION,
  TIMELINE_SECTION,
  MEDIA_GALLERY_SECTION,
  LOGO_GRID_SECTION,
  CTA_BANNER_SECTION,
  PACKAGES_SECTION,
  TESTIMONIAL_SECTION,
  PHILOSOPHY_SECTION,
  STATS_COUNTER_SECTION,
  TEAM_SECTION,
  FAQ_SECTION,
  VIDEO_SHOWREEL_SECTION,
  FEATURED_PROJECT_SECTION,
};
