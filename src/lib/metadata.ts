import type { Metadata } from 'next';

import { urlFor } from '@/sanity/lib/image';
import type { SeoFields } from '@/types/sanity';

const DEFAULT_SITE_TITLE = '56KonFilm';
const DEFAULT_DESCRIPTION = 'Film Production House';

function getMetadataBase(): URL {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }

  return new URL('http://localhost:3000');
}

function resolveSeoValue(
  seo: SeoFields | null | undefined,
  fallbackSeo: SeoFields | null | undefined,
  key: keyof SeoFields
) {
  return seo?.[key] ?? fallbackSeo?.[key];
}

function resolveSeoText(
  seo: SeoFields | null | undefined,
  fallbackSeo: SeoFields | null | undefined,
  key: 'title' | 'description'
): string | undefined {
  const value = resolveSeoValue(seo, fallbackSeo, key);
  return typeof value === 'string' ? value : undefined;
}

function getOgImageUrl(
  seo: SeoFields | null | undefined,
  fallbackSeo: SeoFields | null | undefined
): string | undefined {
  const image = resolveSeoValue(seo, fallbackSeo, 'ogImage');
  if (!image) {
    return undefined;
  }

  return urlFor(image).width(1200).height(630).fit('crop').url();
}

export type MetadataInput = {
  lang: string;
  pathname: string;
  seo?: SeoFields | null;
  fallbackSeo?: SeoFields | null;
  title?: string;
  fallbackTitle?: string;
  siteTitle?: string;
};

export function buildMetadata(input: MetadataInput): Metadata {
  const metadataBase = getMetadataBase();
  const siteTitle = input.siteTitle || input.fallbackTitle || DEFAULT_SITE_TITLE;
  const title = resolveSeoText(input.seo, input.fallbackSeo, 'title') || input.title || siteTitle;
  const description = resolveSeoText(input.seo, input.fallbackSeo, 'description') || DEFAULT_DESCRIPTION;
  const ogImageUrl =
    getOgImageUrl(input.seo, input.fallbackSeo) || new URL('/favicon.ico', metadataBase).toString();

  const cleanPath = input.pathname.startsWith('/') ? input.pathname : `/${input.pathname}`;

  return {
    metadataBase,
    title: cleanPath === `/${input.lang}` ? { default: siteTitle, template: `%s | ${siteTitle}` } : title,
    description,
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
      images: ogImageUrl ? [ogImageUrl] : undefined,
      locale: input.lang === 'th' ? 'th_TH' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: ogImageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}
