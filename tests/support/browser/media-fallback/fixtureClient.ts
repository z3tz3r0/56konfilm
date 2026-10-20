import type { BlogPost } from '@features/blog-preview-section/types';

let posts: BlogPost[] = [];
export function setPosts(value: BlogPost[]) {
  posts = value;
}
/** Resolve invented posts in memory; never instantiate or contact Sanity. */
export const client = { fetch: async () => posts };
