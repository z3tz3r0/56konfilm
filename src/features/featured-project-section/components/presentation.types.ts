import type { Locale, SiteMode } from '@shared/config';
import type { Project } from '@shared/types';
import type { FeaturedProjectsSectionBlock } from '../types';

export interface FeaturedProjectsPresentationProps {
  block: FeaturedProjectsSectionBlock;
  projects: Project[];
  portfolioSlug: string;
  lang: Locale;
  mode: SiteMode;
}
