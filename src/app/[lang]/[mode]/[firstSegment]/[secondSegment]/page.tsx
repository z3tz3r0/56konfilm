import { buildMetadata } from '@shared/lib/seo';
import { Locale, SiteMode } from '@shared/config';
import { Metadata } from 'next';
import { ContentService } from '@services/contentService';
import { notFound } from 'next/navigation';

interface ProjectPageProps {
  params: Promise<{
    lang: Locale;
    mode: SiteMode;
    firstSegment: string;
    secondSegment: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { lang, mode, secondSegment } = await params;

  const project = await ContentService.getProject({
    lang,
    mode,
    slug: secondSegment,
  });
  if (!project) notFound();

  return (
    <article className='min-h-screen py-20'>
      <div className='container mx-auto px-4'>
        {/* TODO: Phase 2 (Hero & Meta Info) */}
        <div className='text-center'>
          <h1 className='text-4xl font-bold'>{project.title}</h1>
          <p className='text-muted-foreground mt-4'>
            {project.client ? `Client: ${project.client}` : 'Personal Project'}
          </p>
        </div>

        {/* TODO: Phase 3 (Portable Text Renderer) */}
      </div>
    </article>
  );
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { lang, mode, firstSegment, secondSegment } = await params;

  const [project, settings] = await Promise.all([
    ContentService.getProject({ lang, mode, slug: secondSegment }),
    ContentService.getSetting({ lang }),
  ]);

  return buildMetadata({
    lang,
    mode,
    pathname: `/${lang}/${mode}/${firstSegment}/${secondSegment}`,
    title: project?.title,
    seo: project?.seo,
    fallbackSeo: settings?.seo,
    fallbackTitle: settings?.siteTitle,
    siteTitle: settings?.siteTitle,
  });
}
