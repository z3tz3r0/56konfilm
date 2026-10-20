import { Project } from '@shared/types';
import { getImageSource } from '@/sanity/lib/image';
import type { Locale } from '@shared/config';
import { MediaWithFallback } from '@shared/components';

interface ProjectHeroProps {
  lang: Locale;
  projectTitle: Project['title'];
  coverImage: Project['coverImage'];
}

export default function ProjectHero({
  lang,
  projectTitle,
  coverImage,
}: ProjectHeroProps) {
  const imageSource = getImageSource(coverImage, { width: 1200, fit: 'max' });
  return (
    <section className='bg-neutral relative grid aspect-video max-h-[400px] w-full place-items-center overflow-hidden rounded-2xl'>
      <MediaWithFallback
        mediaType='image'
        source={imageSource}
        lang={lang}
        alt={projectTitle || 'Project Cover'}
        fill
        priority
        className='object-cover'
        sizes='(max-width: 768px) 100vw, 100vw'
      />
    </section>
  );
}
