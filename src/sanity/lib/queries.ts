import { groq } from 'next-sanity';
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

export const settingsQuery = groq`*[_type == "settings"][0] {
    "favicon": favicon,
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
    "productionPortfolioSlug": productionPortfolioPage->slug.current,
    "weddingPortfolioSlug": weddingPortfolioPage->slug.current,
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

export const allPageSlugsQuery = groq`*[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    siteMode,
    _updatedAt,
    "languages": page[]{
      _key
    }
  }`;

export const allProjectSlugsQuery = groq`*[_type == "project" && defined(slug.current)]{
    "slug": slug.current,
    siteMode,
    _updatedAt,
    "languages": page[]{
      _key
    }
  }`;

export const firstPageSlugByModeQuery = groq`
  *[
    (_type == "page" && siteMode == $mode]) ||
  ] | order(_createdAt asc)[0]{
    "slug": slug.current
  }
`;

export const modeHomeSlugsQuery = groq`
  {
    "production": *[
      (_type == "page" && siteMode in ["both", "production"]) ||
      (_type == "productionPages")
    ] | order(_createdAt asc)[0]{
      "slug": slug.current
    },
    "wedding": *[
      (_type == "page" && siteMode in ["both", "wedding"]) ||
      (_type == "weddingPages")
    ] | order(_createdAt asc)[0]{
      "slug": slug.current
    }
  }
`;

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug && siteMode == $mode][0] {
    _id,
    _type,
    "title": ${LOCALIZED('page')},
    "slug": slug.current,
    "seoTitle": ${LOCALIZED('seoTitle')},
    ${SEO_PROJECTION},
    siteMode,
    "contentBlocks": coalesce(commercialSections, weddingSections)[]{
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
  *[_type == "project" && slug.current == $slug && siteMode == $mode][0] {
    _id,
    _type,
    "title": ${LOCALIZED('title')},
    "overview": ${LOCALIZED('overview')},
    "slug": slug.current,
    publishedAt,
    ${SEO_PROJECTION},
    siteMode,
    client,
    year,
    services,
    coverImage{ asset, crop, hotspot },
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
        && siteMode == $mode
        && coalesce(publishedAt, _createdAt) < coalesce(^.publishedAt, ^._createdAt)
      ] | order(coalesce(publishedAt, _createdAt) desc)[0] {
        "title": ${LOCALIZED('title')},
        "slug": slug.current,
        coverImage{ asset, crop, hotspot }
      },
      *[_type == "project" && siteMode == $mode] | order(coalesce(publishedAt, _createdAt) desc)[0] {
        "title": ${LOCALIZED('title')},
        "slug": slug.current,
        coverImage{ asset, crop, hotspot }
      }
    )
  }
`;
