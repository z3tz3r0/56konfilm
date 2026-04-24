import { groq } from 'next-sanity';
import {
  CTA_PROJECTION,
  IMAGE_PROJECTION,
  LOCALIZED,
  MEDIA_ASSET_PROJECTION,
} from './fragments';

export const HERO_SECTION = groq`
  _type == "heroSection" => {
    "title": ${LOCALIZED('title')},
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

export const TWO_COLUMN_SECTION = groq`
  _type == "twoColumnSection" => {
    layout,
    background,
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
    }
  }
`;

export const CARD_COLLECTION_SECTION = groq`
  _type == "cardCollectionSection" => {
    "layoutVariant": coalesce(layoutVariant, 'standard'),
    "title": ${LOCALIZED('title')},
    "intro": ${LOCALIZED('intro')},
    "hasButton": coalesce(hasButton, false),
    ctaButton { ${CTA_PROJECTION} },
    columns,
    background,
    "hasIcon": coalesce(hasIcon, true),
    cards[]{
      "title": ${LOCALIZED('title')},
      "body": ${LOCALIZED('body')},
      icon,
      bgImage { asset, crop, hotspot },
    }
  }
`;

export const TIMELINE_SECTION = groq`
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

export const MEDIA_GALLERY_SECTION = groq`
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

export const LOGO_GRID_SECTION = groq`
  _type == "logoGridSection" => {
    background,
    "title": ${LOCALIZED('title')},
    logos[]{
      ${IMAGE_PROJECTION}
    }
  }
`;

export const CTA_BANNER_SECTION = groq`
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

export const PACKAGES_SECTION = groq`
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

export const TESTIMONIAL_SECTION = groq`
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

export const PHILOSOPHY_SECTION = groq`
  _type == "philosophySection" => {
    "quote": ${LOCALIZED('quote')},
    background
  }
`;

export const STATS_COUNTER_SECTION = groq`
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

export const TEAM_SECTION = groq`
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

export const FAQ_SECTION = groq`
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

export const VIDEO_SHOWREEL_SECTION = groq`
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
