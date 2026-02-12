import { groq } from 'next-sanity';
import { CTA_PROJECTION, IMAGE_PROJECTION, LOCALIZED, MEDIA_ASSET_PROJECTION } from './fragments';

export const HERO_SECTION = groq`
  _type == "heroSection" => {
    "title": ${LOCALIZED('title')},
    "tagline": ${LOCALIZED('tagline')},
    "parallaxText": ${LOCALIZED('parallaxText')},
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
    "title": ${LOCALIZED('title')},
    "intro": ${LOCALIZED('intro')},
    columns,
    background,
    cards[]{
      "title": ${LOCALIZED('title')},
      "body": ${LOCALIZED('body')},
      icon,
      variant,
      cta{
        ${CTA_PROJECTION}
      }
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
      "description": ${LOCALIZED('description')}
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
      authorImage
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
