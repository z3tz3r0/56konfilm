import type { Metadata } from 'next';
import { urlFor } from '@/sanity/lib/image';
import { Locale, SiteMode } from '@shared/config';
import { SeoFields } from '@shared/types';
import { getBaseURL } from '@shared/utils';

const DEFAULT_SITE_TITLE = '56KonFilm';
const DEFAULT_DESCRIPTION = 'Film Production House';

type MetadataInput = {
  lang: Locale;
  mode: SiteMode;
  pathname: string;
  seo?: SeoFields | null;
  fallbackSeo?: SeoFields | null;
  title?: string;
  fallbackTitle?: string;
  siteTitle?: string;
};

export function buildMetadata(input: MetadataInput): Metadata {
  const metadataBase = getBaseURL();
  const brandName =
    input.siteTitle || input.fallbackTitle || DEFAULT_SITE_TITLE;

  // 1. Get core data
  const title =
    getSeoValue(input.seo, input.fallbackSeo, 'title') ||
    input.title ||
    brandName;
  const description =
    getSeoValue(input.seo, input.fallbackSeo, 'description') ||
    DEFAULT_DESCRIPTION;
  const keywords = getSeoValue(input.seo, input.fallbackSeo, 'keywords');

  // Get image URL
  const ogImageUrl = getOgImageUrl(input.seo, input.fallbackSeo, metadataBase);

  const cleanPath = input.pathname.startsWith('/')
    ? input.pathname
    : `/${input.pathname}`;
  const isHome = cleanPath === `/${input.lang}/${input.mode}`;

  return {
    metadataBase,
    title: isHome
      ? { default: brandName, template: `%s | ${brandName}` }
      : title,
    description,
    keywords,
    alternates: {
      canonical: cleanPath,
      languages: {
        en: cleanPath.replace(/^\/(en|th)/, '/en'),
        th: cleanPath.replace(/^\/(en|th)/, '/th'),
      },
    },
    openGraph: {
      title,
      description,
      siteName: brandName,
      images: ogImageUrl
        ? [{ url: ogImageUrl, width: 1200, height: 630 }]
        : undefined,
      locale: input.lang === 'th' ? 'th_TH' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Helper ดึงค่าจาก SEO Fields
 */
function getSeoValue<T extends keyof SeoFields>(
  seo: SeoFields | null | undefined,
  fallbackSeo: SeoFields | null | undefined,
  key: T
): SeoFields[T] | undefined {
  return (seo?.[key] ?? fallbackSeo?.[key]) || undefined;
}

function getOgImageUrl(
  seo: SeoFields | null | undefined,
  fallbackSeo: SeoFields | null | undefined,
  metadataBase: URL
): string | undefined {
  const ogImage = getSeoValue(seo, fallbackSeo, 'ogImage');
  return ogImage
    ? urlFor(ogImage).width(1200).height(630).fit('crop').url()
    : new URL('/og-default.jpg', metadataBase).toString();
}
