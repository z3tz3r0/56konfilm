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
        'relative flex w-full justify-center px-4 py-20 pb-32',
        mode === 'production'
          ? 'bg-background text-foreground'
          : 'bg-background text-foreground'
      )}
    >
      <div className="container mx-auto max-w-5xl">
        <Link
          href={`/${lang}/work/${nextProject.slug}`}
          onClick={handleClick}
          className="group relative block aspect-video w-full overflow-hidden rounded-lg"
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
          <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-black/30" />

          {/* Content */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center text-white">
            <span
              data-testid="next-project-label"
              className="mb-4 text-sm font-light tracking-[0.2em] uppercase opacity-80 md:text-base"
            >
              Next Project
            </span>
            <h2
              data-testid="next-project-title"
              className="font-serif text-4xl font-medium tracking-tight md:text-6xl lg:text-7xl"
            >
              {nextProject.title}
            </h2>
          </div>
        </Link>
      </div>
    </section>
  );
}
