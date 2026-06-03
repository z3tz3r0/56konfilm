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
  const imageUrl = coverImage
    ? urlFor(coverImage).width(1200).fit('max').url()
    : null;
  return (
    <section className='bg-neutral relative grid aspect-video max-h-[400px] w-full place-items-center overflow-hidden rounded-2xl'>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={projectTitle || 'Project Cover'}
          fill
          priority
          className='object-cover'
          sizes='(max-width: 768px) 100vw, 100vw'
        />
      ) : (
        <AppIcon
          className='text-neutral-foreground bg-transparent dark:bg-transparent'
          iconName={'basil:image-outline'}
        />
      )}
    </section>
  );
}
