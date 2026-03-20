import { env } from '@shared/config';
import { createClient } from 'next-sanity';

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION;

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
});

// Write client for password updates (server-side only)
// Uses SANITY_API_TOKEN from environment variables
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

// --- Sanity Fetch ---
interface SanityFetchParams {
  query: string;
  params?: Record<string, unknown>;
  revalidate?: number | false;
  tags?: string[];
}

/** NOTE: Sanity แนะนำให้เลือกการ cache แนวทางใดแนวทางหนึ่งเท่านั้น
 * ✅ เลือก cache ด้วย tag-based revalidation -> set revalidate เป็น false
 * เลือก cache ด้วย time-based revalidation -> ห้ามส่ง tags ใดๆ เข้ามา
 * for more information: https://github.com/sanity-io/next-sanity
 */
export abstract class SanityBaseService {
  protected static async fetch<T>({
    query,
    params = {},
    revalidate = 31536000, // default = cache 1 ปี
    tags,
  }: SanityFetchParams): Promise<T> {
    try {
      return client.fetch<T>(query, params, {
        cache: 'force-cache', // ต้องใส่เพื่อประหยัด API
        next: {
          revalidate: tags?.length ? false : revalidate, // 👈 Sanity recommended settings
          tags,
        },
      });
    } catch (error) {
      console.error(`[SanityBaseService Error]:`, error);
      throw new Error('❌ Failed to fetch data from Sanity');
    }
  }
}
