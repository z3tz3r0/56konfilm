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
 * Media block projection for collage image slots
 */
const COLLAGE_MEDIA_PROJECTION = groq`
  image { asset, crop, hotspot },
  "alt": ${LOCALIZED('alt')}
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

const PACKAGE_SERVICE_PROJECTION = groq`
  _id,
  "title": ${LOCALIZED('title')},
  "information": ${LOCALIZED('information')}
`;

// Filter before projection so missing or cross-mode references cannot shift IDs.
const PACKAGE_SERVICE_REFERENCES = groq`
  coalesce(services, [])[
    @->_type == "packageService" && @->siteMode == $mode
  ]
`;

const PACKAGE_PROJECTION = groq`
  _id,
  "title": ${LOCALIZED('title')},
  price,
  currency,
  "badgeLabel": ${LOCALIZED('badgeLabel')},
  cta { ${CTA_PROJECTION} },
  "serviceIds": ${PACKAGE_SERVICE_REFERENCES}[]->_id
`;

const PACKAGE_RECAP_PROJECTION = groq`
  "title": ${LOCALIZED('title')},
  price,
  currency,
  cta { ${CTA_PROJECTION} },
  "features": select(
    count(coalesce(recapHighlights, [])) > 0 => (
      recapHighlights[
        _ref in ^.services[]._ref &&
        @->_type == "packageService" && @->siteMode == $mode
      ][]->{ "title": ${LOCALIZED('title')} }
    )[].title,
    (${PACKAGE_SERVICE_REFERENCES}[]->{ "title": ${LOCALIZED('title')} })[0...3][].title
  )
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
  COLLAGE_MEDIA_PROJECTION,
  CTA_PROJECTION,
  PACKAGE_SERVICE_PROJECTION,
  PACKAGE_PROJECTION,
  PACKAGE_RECAP_PROJECTION,
  MEDIA_ASSET_PROJECTION,
  SEO_PROJECTION,
  PROJECT_PROJECTION,
};
