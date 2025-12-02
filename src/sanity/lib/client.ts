import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId, sanityApiToken } from '../env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
});

// Write client for password updates (server-side only)
// Uses SANITY_API_TOKEN from environment variables
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: sanityApiToken,
});
