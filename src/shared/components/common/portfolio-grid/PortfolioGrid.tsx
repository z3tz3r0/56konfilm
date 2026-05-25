import ProjectCard from './ProjectCard';
import { Locale, SiteMode } from '@shared/config';
import { Project } from '@shared/types';

interface PortfolioGridProps {
  projects: Project[];
  lang: Locale;
  mode: SiteMode;
}

export default function PortfolioGrid({
  projects,
  lang,
  mode,
}: PortfolioGridProps) {
  return (
    <section className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          lang={lang}
          mode={mode}
        />
      ))}
    </section>
  );
}
