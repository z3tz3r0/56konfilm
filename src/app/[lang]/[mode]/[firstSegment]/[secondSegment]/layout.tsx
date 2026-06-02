import { ContentService } from '@services/contentService';
import {
  ProjectAside,
  ProjectHero,
  ProjectNavigation,
  SectionShell,
} from '@shared/components';
import { Locale, SiteMode } from '@shared/config';
import { buildMetadata } from '@shared/lib/seo';
import { isSupportedLocale, isSupportedMode } from '@shared/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

interface CommonProps {
  firstSegment: string;
  secondSegment: string;
}

interface ProjectDetailLayoutProps {
  children: ReactNode;
  params: Promise<
    CommonProps & {
      lang: string;
      mode: string;
    }
  >;
}

export default async function ProjectDetailLayout({
  children,
  params,
}: ProjectDetailLayoutProps) {
  const { lang, mode, firstSegment, secondSegment } = await params;

  if (!isSupportedLocale(lang) || !isSupportedMode(mode)) {
    notFound();
  }

  const project = await ContentService.getProject({
    lang,
    mode,
    slug: secondSegment,
  });
  if (!project) notFound();

  return (
    <SectionShell className='overflow-visible pt-[76px] pb-16'>
      <article className='min-h-screen space-y-8'>
        <ProjectHero
          projectTitle={project.title}
          coverImage={project.coverImage}
        />
        <section className='flex flex-col gap-8 md:flex-row'>
          <ProjectAside lang={lang} project={project} />
          <>{children}</>
        </section>
        <ProjectNavigation
          lang={lang}
          mode={mode}
          firstSegment={firstSegment}
          nextProject={project.nextProject}
        />
      </article>
    </SectionShell>
  );
}

interface GenerateMetadataProps {
  params: Promise<CommonProps & { lang: Locale; mode: SiteMode }>;
}

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
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
