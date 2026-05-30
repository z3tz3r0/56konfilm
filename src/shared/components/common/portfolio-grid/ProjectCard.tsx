import { urlFor } from '@/sanity/lib/image';
import { Locale, SiteMode } from '@shared/config';
import { Project } from '@shared/types';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  lang: Locale;
  mode: SiteMode;
  portfolioSlug: string;
}

export default function ProjectCard({
  project,
  lang,
  mode,
  portfolioSlug = 'portfolio',
}: ProjectCardProps) {
  const { title, slug, coverImage, projectDate } = project;

  // ดึงเฉพาะปีมาแสดงผล
  const year = projectDate ? new Date(projectDate).getFullYear() : '';
  const projectUrl = `/${lang}/${mode}/${portfolioSlug}/${slug}`;
  const renderProjectImage = () => (
    <section className='relative aspect-367/224 w-full overflow-hidden'>
      {coverImage ? (
        <>
          <Image
            src={urlFor(coverImage).width(1280).height(720).fit('crop').url()}
            alt={title}
            fill
            className='absolute object-cover transition-transform duration-700 ease-out group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
          <div className='group-hover:bg-background/10 absolute inset-0 bg-transparent transition-colors duration-700 ease-out' />
        </>
      ) : (
        <div className='bg-off-white text-text-tertiary flex h-full w-full items-center justify-center'>
          {lang === 'en' ? 'No Image' : 'ไม่มีรูปภาพ'}
        </div>
      )}
    </section>
  );

  return (
    <Link
      href={projectUrl}
      className='group bg-card row-span-2 grid grid-rows-subgrid gap-0 overflow-hidden rounded-2xl'
    >
      {renderProjectImage()}
      <section className='grid gap-2 p-4'>
        <span className='text-text-secondary text-xs'>{year}</span>
        <h3 className='group-hover:text-primary text-sm font-medium transition-colors'>
          {title}
        </h3>
      </section>
    </Link>
  );
}
