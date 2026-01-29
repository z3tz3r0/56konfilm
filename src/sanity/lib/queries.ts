import { createClient, groq } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';
import { LOCALIZED } from './queries/fragments';
import {
  CARD_COLLECTION_SECTION,
  CTA_BANNER_SECTION,
  HERO_SECTION,
  LOGO_GRID_SECTION,
  MEDIA_GALLERY_SECTION,
  TIMELINE_SECTION,
  TWO_COLUMN_SECTION,
} from './queries/sections';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
});

export const settingsQuery = groq`*[_type == "settings"][0] {
    "siteTitle": ${LOCALIZED('siteTitle')},
    "productionNav": productionNav[]{
      "label": ${LOCALIZED('label')},
      url
    },
    "weddingNav": weddingNav[]{
      "label": ${LOCALIZED('label')},
      url
    },
    "companyTitle": ${LOCALIZED('companyTitle')},
    "address": ${LOCALIZED('address')},
    "contactTitle": ${LOCALIZED('contactTitle')},
    "contacts": ${LOCALIZED('contacts')},
    "socialMediaTitle": ${LOCALIZED('socialMediaTitle')},
    "socialLinks": socialLinks[]{
      "label": ${LOCALIZED('label')},
      url
    }
  }`;

export const projectsByModelQuery = groq`*[_type == "project" && $mode in siteMode] | order(publishedAt desc) {
    _id,
    "title": ${LOCALIZED('title')},
    "overview": ${LOCALIZED('overview')},
    "slug": slug.current,
    siteMode,
    coverImage
  }
`;

export const allPageSlugsQuery = groq`*[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    siteMode
  }`;

export const firstPageSlugByModeQuery = groq`
  *[_type == "page" && siteMode == $mode] | order(_createdAt asc)[0]{
    "slug": slug.current
  }
`;

export const modeHomeSlugsQuery = groq`
  {
    "production": *[_type == "page" && siteMode == "production"] | order(_createdAt asc)[0]{
      "slug": slug.current
    },
    "wedding": *[_type == "page" && siteMode == "wedding"] | order(_createdAt asc)[0]{
      "slug": slug.current
    }
  }
`;

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug && siteMode == $mode][0] {
    "title": page,
    "slug": slug.current,
    seoTitle,
    siteMode,
    contentBlocks[]{
      _key,
      _type,
      ${HERO_SECTION},
      ${TWO_COLUMN_SECTION},
      ${CARD_COLLECTION_SECTION},
      ${TIMELINE_SECTION},
      ${MEDIA_GALLERY_SECTION},
      ${LOGO_GRID_SECTION},
      ${CTA_BANNER_SECTION}
    }
  }
`;
