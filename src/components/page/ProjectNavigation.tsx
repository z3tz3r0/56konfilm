'use client';

import { useMode } from '@/hooks/useMode';
import { cn } from '@/lib/utils';
import { urlFor } from '@/sanity/lib/image';
import { useTransitionStore } from '@/stores/useTransitionStore';
import { Project } from '@/types/sanity';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';

interface ProjectNavigationProps {
  nextProject: NonNullable<Project['nextProject']>;
  mode: 'production' | 'wedding';
}

export default function ProjectNavigation({
  nextProject,
  mode,
}: ProjectNavigationProps) {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  
  const { setMode } = useMode();
  const pendingPath = useTransitionStore((s) => s.pendingPath);
  const setPendingPath = useTransitionStore((s) => s.setPendingPath);
  const setIsTransitioning = useTransitionStore((s) => s.setIsTransitioning);
  const resetTransition = useTransitionStore((s) => s.resetTransition);
  const [, startTransition] = useTransition();
  const pathname = usePathname();

  useEffect(() => {
    if (!pendingPath) return;
    if (pathname === pendingPath) {
      resetTransition();
      setMode(mode);
    }
  }, [pathname, pendingPath, resetTransition, setMode, mode]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const { isTransitioning, pendingPath } = useTransitionStore.getState();
    if (isTransitioning || pendingPath) return;
    const path = `/${lang}/work/${nextProject.slug}`;
    setPendingPath(path);
    setMode(mode);
    setIsTransitioning(true);
    startTransition(() => {
      router.push(path);
    });
  };

  const imageUrl = nextProject.coverImage
    ? urlFor(nextProject.coverImage).width(1920).height(1080).url()
    : null;

  return (
    <section
      data-testid="project-navigation"
      className={cn(
        'relative w-full py-20 pb-32 flex justify-center px-4',
        mode === 'production' ? 'bg-background text-foreground' : 'bg-background text-foreground'
      )}
    >
      <div className="container mx-auto max-w-5xl">
        <Link
          href={`/${lang}/work/${nextProject.slug}`}
          onClick={handleClick}
          className="group relative block w-full overflow-hidden rounded-lg aspect-video"
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={nextProject.title}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 text-white p-8">
            <span
              data-testid="next-project-label"
              className="uppercase tracking-[0.2em] text-sm md:text-base font-light mb-4 opacity-80"
            >
              Next Project
            </span>
            <h2
              data-testid="next-project-title"
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight"
            >
              {nextProject.title}
            </h2>
          </div>
        </Link>
      </div>
    </section>
  );
}
