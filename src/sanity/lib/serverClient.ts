import 'server-only';
import { createClient, type SanityClient } from 'next-sanity';
import { env } from '@shared/config/env';

/** Never fall back to anonymous access when a server secret is missing. */
export function getCredentialClient(): SanityClient {
  if (!env.SANITY_API_TOKEN?.trim()) {
    throw new Error('CMS credential store is not configured.');
  }
  return createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
    useCdn: false,
    perspective: 'raw',
    token: env.SANITY_API_TOKEN,
  });
}
