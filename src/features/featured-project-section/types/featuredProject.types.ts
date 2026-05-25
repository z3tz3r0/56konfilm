import { BaseBlock, ContentCta, SectionHeading } from '@shared/types';
import { Project } from '@shared/types/project';

export interface FeaturedProjectsSectionBlock extends BaseBlock {
  _type: 'featuredProjectsSection';
  heading?: SectionHeading;
  sourceType: 'latest' | 'curated';
  selectedProjects?: Project[];
  ctaButton?: ContentCta;
  background?: string;
}
