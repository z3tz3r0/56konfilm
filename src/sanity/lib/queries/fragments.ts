import { groq } from 'next-sanity';

/**
 * Reusable localization fragment
 * Usage: "title": ${LOCALIZED('title')}
 */
export const LOCALIZED = (field: string) => 
  groq`coalesce(${field}[_key == $lang][0].value, ${field}[_key == "en"][0].value, ${field}[0].value)`;

/**
 * Common Image projection
 */
export const IMAGE_PROJECTION = groq`
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
export const CTA_PROJECTION = groq`
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
export const MEDIA_ASSET_PROJECTION = groq`
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

export const SEO_PROJECTION = groq`
  seo {
    "title": ${LOCALIZED('title')},
    "description": ${LOCALIZED('description')},
    "ogImage": ogImage{
      asset,
      crop,
      hotspot
    }
  }
`;
