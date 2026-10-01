import ProjectCard from './ProjectCard';
import AnimatedPortfolioGrid from './AnimatedPortfolioGrid';
import type { Locale, SiteMode } from '@shared/config';
import type { Project } from '@shared/types';

interface PortfolioGridProps {
  projects: Project[];
  lang: Locale;
  mode: SiteMode;
  portfolioSlug: string;
}

/**
 * Renders project cards with localized links inside the animated grid.
 * Resets the reveal when the ordered project IDs or route context change.
 */
export default function PortfolioGrid({
  projects,
  lang,
  mode,
  portfolioSlug = 'portfolio',
}: PortfolioGridProps) {
  // Reset the reveal only when the ordered project set or route context changes,
  // not when the same limit is silently synchronized into the URL.
  const revealKey = JSON.stringify([
    lang,
    mode,
    portfolioSlug,
    projects.map((project) => project._id),
  ]);

  return (
    <AnimatedPortfolioGrid
      key={revealKey}
      className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'
    >
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          lang={lang}
          mode={mode}
          portfolioSlug={portfolioSlug}
        />
      ))}
    </AnimatedPortfolioGrid>
  );
}
