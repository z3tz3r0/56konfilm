import type { Locale, SiteMode } from '@shared/config';
import type { FeaturedProjectsSectionBlock } from './types';
import {
  CtaButton,
  PortfolioGrid,
  SectionHeader,
  SectionShell,
} from '@shared/components';
import type { Project } from '@shared/types';
import { ContentService } from '@services/contentService';
import { cn } from '@shared/utils/styling/tailwindUtils';
import { getJustifyClass } from '@shared/utils/styling/styleVariants';

interface FeaturedProjectsSectionProps {
  block: FeaturedProjectsSectionBlock;
  lang: Locale;
  mode: SiteMode;
}

/**
 * Renders latest or curated projects using the portfolio route for the site
 * mode, with the configured heading, background, and optional CTA.
 */
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
    <SectionShell background={block.background} sanityType={block._type}>
      <div className='flex flex-col gap-8'>
        <SectionHeader heading={block.heading} />
        <PortfolioGrid
          projects={projects}
          portfolioSlug={portfolioSlug}
          lang={lang}
          mode={mode}
        />
        {block.ctaButton && (
          <div className={cn('flex', getJustifyClass(block.heading?.align))}>
            <CtaButton ctaButton={block.ctaButton} mode={mode} lang={lang} />
          </div>
        )}
      </div>
    </SectionShell>
  );
}
