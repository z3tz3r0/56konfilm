import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
});

export const settingsQuery = `
  *[_type == "settings"][0] {
    "siteTitle": siteTitle[_key == $lang][0].value,
    "mainNav": mainNav[]{
      "label": label[_key == $lang][0].value,
      url
  }
  }
`;

// GROQ for Filtered Projects (by mode)
export const projectsByModelQuery = `
  *[_type == "project" && $mode in siteMode] | order(publishedAt desc) {
    _id,
    "title": title[_key === $lang][0].value,
    "overview": overview[_key == $lang][0].value,
    "slug": slug.current,
    siteMode,
    coverImage
  }
`;

// GROQ for a single Page with all its blocks
export const pageBySlugQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    "title": title[_key == $lang][0].value,
    "slug": slug.current,
    contentBlocks[]{
      _key,
      _type,
      _type == "heroSection" => {
        "title": title[_key == $lang][0].value,
        "tagline": tagline[_key == $lang][0].value,
        backgroundImage
      },
      // Add other block types here using the same pattern
      // _type == "galleryBlock" => { ... }
    }
  }
`;
