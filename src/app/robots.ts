import { env } from '@shared/config';
import { getBaseURL } from '@shared/utils';
import type { MetadataRoute } from 'next';

function isProductionEnvironment() {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV === 'production';
  }

  return env.NODE_ENV === 'production';
}

export default function robots(): MetadataRoute.Robots {
  const baseSiteURL = getBaseURL();
  const isProduction = isProductionEnvironment();

  return {
    rules: {
      userAgent: '*',
      allow: isProduction ? '/' : '',
      disallow: isProduction ? ['/api', '/sanity-cms'] : '/',
    },
    sitemap: `${baseSiteURL}/sitemap.xml`,
  };
}
