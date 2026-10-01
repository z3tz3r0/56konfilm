import type { Locale, SiteMode } from '@shared/config';
import type { FeaturedProjectsSectionBlock } from './types';
import { ModeGuard } from '@shared/components';
import type { Project } from '@shared/types';
import { ContentService } from '@services/contentService';
import Production from './components/Production';
import Wedding from './components/Wedding';

interface FeaturedProjectsSectionProps {
  block: FeaturedProjectsSectionBlock;
  lang: Locale;
  mode: SiteMode;
}

export default async function FeaturedProjectSection({
  block,
  lang,
  mode,
}: FeaturedProjectsSectionProps) {
  const { sourceType, selectedProjects } = block;

  const settings = await ContentService.getSetting({ lang });
  const portfolioSlug =
    mode === 'production'
      ? settings.productionPortfolioSlug
      : settings.weddingPortfolioSlug;

  let projects: Project[] = [];
  if (sourceType === 'latest') {
    const fetchProjects = await ContentService.getLatestProjects({
      lang,
      mode,
    });
    projects = fetchProjects || [];
  } else if (sourceType === 'curated' && selectedProjects) {
    projects = selectedProjects;
  }

  return (
    <ModeGuard
      ProductionComponent={Production}
      WeddingComponent={Wedding}
      mode={mode}
      props={{ block, projects, portfolioSlug, lang, mode }}
    />
  );
}
