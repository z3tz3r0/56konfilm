import { groq } from 'next-sanity';

/**
 * Reusable localization fragment
 * Usage: "title": ${LOCALIZED('title')}
 */
const LOCALIZED = (field: string) =>
  groq`coalesce(
    ${field}[language == $lang][0].value,
    ${field}[_key == $lang][0].value,
    ${field}[language == "en"][0].value,
    ${field}[_key == "en"][0].value,
    ${field}[0].value
  )`;

/**
 * Common Image projection
 */
const IMAGE_PROJECTION = groq`
  image {
    asset,
    crop,
    hotspot,
    "alt": ${LOCALIZED('alt')}
  }
`;

/**
 * Common CTA projection
 */
const CTA_PROJECTION = groq`
  "label": ${LOCALIZED('label')},
  style,
  linkType,
  pageRef->{
    "slug": slug.current
  },
  externalUrl
`;

/**
 * Media Asset projection (used in Hero)
 */
const MEDIA_ASSET_PROJECTION = groq`
  _type,
  "url": asset->url,
  "mimeType": asset->mimeType,
  "image": select(
    _type == "image" => {
      asset,
      crop,
      hotspot
    },
    _type == "backgroundVideo" => null
  )
`;

const SEO_PROJECTION = groq`
  seo {
    "title": ${LOCALIZED('title')},
    "description": ${LOCALIZED('description')},
    "keywords": ${LOCALIZED('keywords')},
    "ogImage": ogImage{
      asset,
      crop,
      hotspot
    }
  }
`;

const PROJECT_PROJECTION = groq`
  "title": ${LOCALIZED('title')},
  "slug": slug.current,
  coverImage {
    asset,
    crop,
    hotspot
  },
  siteMode,
  "overview": ${LOCALIZED('overview')},
  "body": ${LOCALIZED('body')},
  client,
  projectDate,
  services,
  "tags": tags[]->{ 'title': ${LOCALIZED('title')} }.title,
  ${SEO_PROJECTION}
`;

export {
  LOCALIZED,
  IMAGE_PROJECTION,
  CTA_PROJECTION,
  MEDIA_ASSET_PROJECTION,
  SEO_PROJECTION,
  PROJECT_PROJECTION,
};
