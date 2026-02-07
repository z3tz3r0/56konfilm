import { client } from './client';

type SanityFetchParams = {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number;
};

export async function sanityFetch<T>({ 
  query, 
  params = {}, 
  tags = [],
  revalidate = 3600 // Default to 1 hour
}: SanityFetchParams): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {
      revalidate,
      tags,
    },
  });
}
