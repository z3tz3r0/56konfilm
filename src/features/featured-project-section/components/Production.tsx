import {
  CtaButton,
  PortfolioGrid,
  SectionHeader,
  SectionShell,
} from '@shared/components';
import { cn } from '@shared/utils/styling/tailwindUtils';
import { getJustifyClass } from '@shared/utils/styling/styleVariants';
import type { FeaturedProjectsPresentationProps } from './presentation.types';

export default function Production({
  block,
  projects,
  portfolioSlug,
  lang,
  mode,
}: FeaturedProjectsPresentationProps) {
  const buttonAlignClass = getJustifyClass(block.heading?.align);

  return (
    <SectionShell background={block.background} sanityType={block._type}>
      <div className='space-y-8'>
        <SectionHeader heading={block.heading} />
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
