import Image from 'next/image';
import { Project } from '@shared/types';
import { urlFor } from '@/sanity/lib/image';
import { AppIcon } from '@shared/components/common';

interface ProjectHeroProps {
  projectTitle: Project['title'];
  coverImage: Project['coverImage'];
}

export default function ProjectHero({
  projectTitle,
  coverImage,
}: ProjectHeroProps) {
  return (
    <section className='bg-neutral relative grid aspect-video max-h-[400px] w-full place-items-center overflow-hidden rounded-2xl'>
      {coverImage ? (
        <Image
          src={urlFor(coverImage).width(1280).fit('crop').url() || ''}
          alt={projectTitle || 'Project Cover'}
          fill
          priority
          className='object-cover'
          sizes='(max-width: 768px) 100vw, 100vw'
        />
      ) : (
        <AppIcon
          className='text-neutral-foreground dark:bg-transparent'
          iconName={'basil:image-outline'}
        />
      )}
    </section>
  );
}
