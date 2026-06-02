import { Locale, SiteMode } from '@shared/config';
import { ContentService } from '@services/contentService';
import { notFound } from 'next/navigation';

interface ProjectPageProps {
  params: Promise<{
    lang: Locale;
    mode: SiteMode;
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
    <section className='flex-1'>
      {/* TODO: พื้นที่สำหรับ Phase 3 (Portable Text Renderer) */}
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight md:text-5xl'>
          {project.title}
        </h1>
        {project.overview && (
          <p className='text-text-secondary text-lg leading-relaxed md:text-xl'>
            {project.overview}
          </p>
        )}
      </div>
    </section>
  );
}
