import { createClient, groq } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';
import { LOCALIZED, SEO_PROJECTION } from './queries/fragments';
import {
    CARD_COLLECTION_SECTION,
    CTA_BANNER_SECTION,
    HERO_SECTION,
    LOGO_GRID_SECTION,
    MEDIA_GALLERY_SECTION,
    PACKAGES_SECTION,
    PHILOSOPHY_SECTION,
    TESTIMONIAL_SECTION,
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
    "favicon": favicon.asset->url,
    "siteTitle": ${LOCALIZED('siteTitle')},
    ${SEO_PROJECTION},
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

export const allProjectSlugsQuery = groq`*[_type == "project" && defined(slug.current)]{
    "slug": slug.current,
    siteMode
  }`;

export const firstPageSlugByModeQuery = groq`
  *[_type == "page" && siteMode in ["both", $mode]] | order(_createdAt asc)[0]{
    "slug": slug.current
  }
`;

export const modeHomeSlugsQuery = groq`
  {
    "production": *[_type == "page" && siteMode in ["both", "production"]] | order(_createdAt asc)[0]{
      "slug": slug.current
    },
    "wedding": *[_type == "page" && siteMode in ["both", "wedding"]] | order(_createdAt asc)[0]{
      "slug": slug.current
    }
  }
`;

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug && siteMode in ["both", $mode]][0] {
    "title": ${LOCALIZED('page')},
    "slug": slug.current,
    "seoTitle": ${LOCALIZED('seoTitle')},
    ${SEO_PROJECTION},
    siteMode,
    "contentBlocks": select(
      siteMode == "both" && $mode == "wedding" => contentBlocksWedding,
      siteMode == "both" && $mode == "production" => contentBlocks,
      siteMode == "wedding" => coalesce(contentBlocksWedding, contentBlocks),
      contentBlocks
    )[]{
      _key,
      _type,
      ${HERO_SECTION},
      ${TWO_COLUMN_SECTION},
      ${CARD_COLLECTION_SECTION},
      ${TIMELINE_SECTION},
      ${MEDIA_GALLERY_SECTION},
      ${LOGO_GRID_SECTION},
      ${CTA_BANNER_SECTION},
      ${PACKAGES_SECTION},
      ${TESTIMONIAL_SECTION},
      ${PHILOSOPHY_SECTION}
    }
  }
`;

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug && $mode in siteMode][0] {
    _id,
    "title": ${LOCALIZED('title')},
    "overview": ${LOCALIZED('overview')},
    "slug": slug.current,
    publishedAt,
    ${SEO_PROJECTION},
    siteMode,
    client,
    year,
    services,
    coverImage,
    contentBlocks[]{
      _key,
      _type,
      ${HERO_SECTION},
      ${TWO_COLUMN_SECTION},
      ${MEDIA_GALLERY_SECTION},
      ${LOGO_GRID_SECTION},
      ${CTA_BANNER_SECTION},
      ${CARD_COLLECTION_SECTION},
      ${TIMELINE_SECTION},
      ${PACKAGES_SECTION},
      ${TESTIMONIAL_SECTION},
      ${PHILOSOPHY_SECTION}
    },
    "nextProject": coalesce(
      *[
        _type == "project"
        && $mode in siteMode
        && coalesce(publishedAt, _createdAt) < coalesce(^.publishedAt, ^._createdAt)
      ] | order(coalesce(publishedAt, _createdAt) desc)[0] {
        "title": ${LOCALIZED('title')},
        "slug": slug.current,
        coverImage
      },
      *[_type == "project" && $mode in siteMode] | order(coalesce(publishedAt, _createdAt) desc)[0] {
        "title": ${LOCALIZED('title')},
        "slug": slug.current,
        coverImage
      }
    )
  }
`;
