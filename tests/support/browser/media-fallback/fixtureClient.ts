import type { BlogPost } from '@features/blog-preview-section/types';

let posts: BlogPost[] = [];
/** Replace the in-memory posts returned by the browser fixture client. */
export function setPosts(value: BlogPost[]) {
  posts = value;
}
/** Resolve invented posts in memory; never instantiate or contact Sanity. */
export const client = { fetch: async () => posts };
