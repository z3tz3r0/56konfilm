import { urlFor } from '@/sanity/lib/image';
import { Project } from '@shared/types';

interface Params {
  project: Project;
  videoData: {
    url: string;
    name: string;
  };
}

export function buildProjectJsonLd({ project, videoData }: Params) {
  const thumbnailUrl = project.coverImage
    ? urlFor(project.coverImage).width(1280).height(720).fit('crop').url()
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: videoData.name,
    description: project.overview || project.title,
    thumbnailUrl: thumbnailUrl ? [thumbnailUrl] : undefined,
    uploadDate: project.publishedAt || new Date().toISOString(),
    contentUrl: videoData.url,
  };
}
