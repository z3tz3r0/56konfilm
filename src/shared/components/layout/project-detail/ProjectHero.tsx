import Image from 'next/image';
import { Project } from '@shared/types';
import { urlFor } from '@/sanity/lib/image';

interface ProjectHeroProps {
  projectTitle: Project['title'];
  coverImage: Project['coverImage'];
}

export default function ProjectHero({
  projectTitle,
  coverImage,
}: ProjectHeroProps) {
  return (
    <>
      {/* 1. Project Cover (รูปปก) */}
      {coverImage && (
        <section className='relative aspect-video max-h-[400px] w-full overflow-hidden rounded-2xl'>
          <Image
            src={urlFor(coverImage).width(1280).fit('crop').url() || ''}
            alt={projectTitle || 'Project Cover'}
            fill
            priority
            className='object-cover'
            sizes='(max-width: 768px) 100vw, 100vw'
          />
        </section>
      )}
    </>
  );
}
