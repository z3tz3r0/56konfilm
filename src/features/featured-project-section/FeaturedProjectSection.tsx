import { Locale, SiteMode } from '@shared/config';
import { FeaturedProjectsSectionBlock } from './types';
import {
  CtaButton,
  PortfolioGrid,
  SectionHeader,
  SectionShell,
} from '@shared/components';
import { Project } from '@shared/types';
import { ContentService } from '@services/contentService';
import { cn, getJustifyClass } from '@shared/utils';

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
  const { heading, sourceType, selectedProjects } = block;

  const settings = await ContentService.getSetting({ lang });
  const portfolioSlug =
    mode === 'production'
      ? settings.productionPortfolioSlug
      : settings.weddingPortfolioSlug;
  const buttonAlignClass = getJustifyClass(heading?.align);

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
      <div className='space-y-8'>
        <SectionHeader heading={heading} />
        <PortfolioGrid
          projects={projects}
          portfolioSlug={portfolioSlug}
          lang={lang}
          mode={mode}
        />
        {block.ctaButton && (
          <div className={cn('flex', buttonAlignClass)}>
            <CtaButton ctaButton={block.ctaButton} mode={mode} lang={lang} />
          </div>
        )}
      </div>
    </SectionShell>
  );
}
