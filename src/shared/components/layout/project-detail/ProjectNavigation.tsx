import { urlFor } from '@/sanity/lib/image';
import { AppIcon } from '@shared/components';
import { Locale, SiteMode } from '@shared/config';
import { Project } from '@shared/types';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectNavigationProps {
  lang: Locale;
  mode: SiteMode;
  firstSegment: string;
  nextProject: Project['nextProject'];
}

export default function ProjectNavigation({
  lang,
  mode,
  firstSegment,
  nextProject,
}: ProjectNavigationProps) {
  const isEngLang = lang === 'en';

  // URL สำหรับกลับไปหน้า Portfolio (อ้างอิงจาก firstSegment เช่น /th/production/portfolio)
  const backUrl = `/${lang}/${mode}/${firstSegment}`;

  return (
    <nav className='border-steel-gray/50 mt-16 flex flex-col-reverse items-center justify-between gap-8 border-t pt-10 md:mt-24 md:flex-row'>
      {/* 1. ปุ่มย้อนกลับ (Back to Portfolio) */}
      <Link
        href={backUrl}
        className='group text-text-secondary hover:text-text-primary flex items-center gap-2 transition-colors duration-300'
      >
        {/* ลูกศรซ้ายพร้อม Animation ขยับเมื่อ Hover */}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='transition-transform duration-300 group-hover:-translate-x-1'
        >
          <path d='m12 19-7-7 7-7' />
          <path d='M19 12H5' />
        </svg>
        <span className='font-medium'>
          {isEngLang ? 'Back to Portfolio' : 'กลับสู่หน้าผลงาน'}
        </span>
      </Link>

      {/* 2. โปรเจกต์ถัดไป (Next Project) */}
      {nextProject && (
        <Link
          href={`/${lang}/${mode}/${firstSegment}/${nextProject.slug}`}
          className='group flex w-full flex-row-reverse items-center justify-center gap-4 md:w-auto md:flex-row md:justify-end md:text-right'
        >
          <div className='flex flex-col'>
            <span className='text-text-secondary mb-1 text-sm'>
              {isEngLang ? 'Next Project' : 'โปรเจกต์ถัดไป'}
            </span>
            <span className='text-text-primary group-hover:text-primary text-lg font-bold transition-colors duration-300 md:text-xl'>
              {nextProject.title}
            </span>
          </div>

          {/* รูป Cover ของโปรเจกต์ถัดไป */}
          {nextProject.coverImage ? (
            <div className='group-hover:ring-primary relative grid h-16 w-16 place-items-center overflow-hidden rounded-full ring-2 ring-transparent transition-all duration-300 md:h-20 md:w-20'>
              <Image
                src={urlFor(nextProject.coverImage)
                  .width(200)
                  .height(200)
                  .fit('crop')
                  .url()}
                alt={nextProject.title || 'Next Project'}
                fill
                className='object-cover'
              />
            </div>
          ) : (
            <AppIcon
              className='dark:bg-neutral text-text-secondary'
              iconName={'basil:image-outline'}
            />
          )}
        </Link>
      )}
    </nav>
  );
}
