import PageBuilder from '@/components/page/PageBuilder';
import ProjectNavigation from '@/components/page/ProjectNavigation';
import JsonLd from '@/components/seo/JsonLd';
import { resolvePreferences } from '@/lib/i18nUtils';
import { buildMetadata } from '@/lib/metadata';
import { sanityFetch } from '@/sanity/lib/fetch';
import { urlFor } from '@/sanity/lib/image';
import { projectBySlugQuery, settingsQuery } from '@/sanity/lib/queries';
import { PageDocument, Project } from '@/types/sanity';
import { SiteSettings } from '@/types/siteSettings';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const PAGE_REVALIDATE_SECONDS = 3600;

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

// Ensure dynamic rendering to support cookie-based mode switching
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const { mode } = await resolvePreferences();
  const [project, settings] = await Promise.all([
    fetchProject(slug, lang, mode),
    sanityFetch<SiteSettings | null>({
      query: settingsQuery,
      params: { lang },
      tags: ['settings'],
    }),
  ]);

  return buildMetadata({
    lang,
    pathname: `/${lang}/work/${slug}`,
    title: project?.title || settings?.siteTitle || '56KonFilm',
    seo: project?.seo,
    fallbackSeo: settings?.seo,
    fallbackTitle: settings?.siteTitle,
    siteTitle: settings?.siteTitle,
  });
}

async function fetchProject(
  slug: string,
  lang: string,
  mode: string
): Promise<Project | null> {
  const project = await sanityFetch<Project | null>({
    query: projectBySlugQuery,
    params: { slug, lang, mode },
    tags: ['project', slug],
  });

  return project;
}

function getE2eMockProject(slug: string, mode: string): Project | null {
  const isE2E = process.env.E2E_TEST === '1';
  const isDev = process.env.NODE_ENV !== 'production';

  if (!isE2E && !isDev) {
    return null;
  }

  if (slug === 'e2e-hybrid-gallery') {
    return {
      _id: 'e2e-hybrid-gallery',
      title: 'Hybrid Gallery Test',
      overview: 'Testing video/image mix',
      siteMode: [mode as 'production' | 'wedding'],
      slug,
      coverImage: {
        asset: {
          _ref: 'image-00000000000000000000000000000000-1920x1080-jpg',
          _type: 'reference',
        },
      },
      nextProject: {
        title: 'Next Test Project',
        slug: 'e2e-project-magazine-layout',
        coverImage: {
          asset: {
            _ref: 'image-00000000000000000000000000000000-1920x1080-jpg',
            _type: 'reference',
          },
        },
      },
      contentBlocks: [
        {
          _type: 'mediaGallerySection',
          heading: {
            heading: 'Hybrid Gallery',
            body: 'Testing mixed media content',
          },
          items: [
            {
              _key: 'item-video-1',
              mediaType: 'video',
              videoUrl: 'https://cdn.sanity.io/files/test/video.mp4',
              label: 'Video Item',
            },
            {
              _key: 'item-image-1',
              mediaType: 'image',
              media: {
                image: {
                  asset: {
                    _ref: 'image-e2emock-1000x1000-jpg',
                    _type: 'reference',
                  },
                },
              },
              label: 'Image Item',
            },
          ],
        },
      ],
    };
  }

  if (slug !== 'atdd-magazine-test') {
    return null;
  }

  return {
    _id: 'e2e-project-magazine-layout',
    title: 'E2E Magazine Project',
    overview: 'Mock overview for e2e validation.',
    siteMode: [mode as 'production' | 'wedding'],
    slug,
      coverImage: {
        asset: {
          _ref: 'image-00000000000000000000000000000000-1920x1080-jpg',
          _type: 'reference',
        },
      },
    client: 'E2E Client',
    year: '2026',
    services: ['Direction', 'Post-Production'],
    contentBlocks: [
      {
        _type: 'heroSection',
        title: 'E2E Hero',
        tagline: 'Mock Hero Tagline',
      },
      {
        _type: 'twoColumnSection',
        layout: 'textLeft',
        content: {
          heading: 'E2E Two Column',
          body: 'Mock two column body.',
        },
      },
      {
        _type: 'mediaGallerySection',
        heading: {
          heading: 'E2E Media Gallery',
          body: 'Mock gallery body.',
        },
        items: [
          {
            _key: 'e2e-video',
            mediaType: 'video',
            videoUrl: 'https://cdn.sanity.io/files/test/e2e-project-video.mp4',
            label: 'E2E Project Reel',
          },
        ],
      },
    ],
  };
}

function getProjectVideoData(project: Project) {
  const mediaSection = project.contentBlocks?.find(
    (block) => block._type === 'mediaGallerySection'
  );
  const firstVideo = mediaSection?.items?.find((item) => item.mediaType === 'video' && item.videoUrl);
  if (!firstVideo?.videoUrl) {
    return null;
  }

  return {
    url: firstVideo.videoUrl,
    name: firstVideo.label || project.title,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { lang, slug } = await params;

  const { mode } = await resolvePreferences();
  const e2eProject = getE2eMockProject(slug, mode);
  const project = await fetchProject(slug, lang, mode);
  const resolvedProject = e2eProject
    ? {
        ...e2eProject,
        ...project,
        client: project?.client ?? e2eProject.client,
        year: project?.year ?? e2eProject.year,
        services: project?.services ?? e2eProject.services,
        contentBlocks:
          project?.contentBlocks?.length
            ? project.contentBlocks
            : e2eProject.contentBlocks,
        nextProject: project?.nextProject ?? e2eProject.nextProject,
      }
    : project;


  if (!resolvedProject) {
    notFound();
  }

  // Adapt Project to PageDocument for PageBuilder
  // PageBuilder primarily uses contentBlocks
  const pageDocument: PageDocument = {
    slug: resolvedProject.slug,
    title: resolvedProject.title,
    // Align with current mode for correct styling/behavior
    siteMode: mode,
    contentBlocks: resolvedProject.contentBlocks,
    seoTitle: resolvedProject.title, // Fallback
  };

  const metadata = {
    client: resolvedProject.client,
    year: resolvedProject.year,
    services: resolvedProject.services,
  };

  const videoData = getProjectVideoData(resolvedProject);
  const thumbnailUrl = resolvedProject.coverImage
    ? urlFor(resolvedProject.coverImage).width(1280).height(720).fit('crop').url()
    : undefined;

  const jsonLd = videoData
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: videoData.name,
        description: resolvedProject.overview || resolvedProject.title,
        thumbnailUrl: thumbnailUrl ? [thumbnailUrl] : undefined,
        uploadDate: resolvedProject.publishedAt || new Date().toISOString(),
        contentUrl: videoData.url,
      }
    : null;

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <PageBuilder page={pageDocument} metadata={metadata} />
      {resolvedProject.nextProject && (
        <ProjectNavigation nextProject={resolvedProject.nextProject} mode={mode} />
      )}
    </>
  );
}
