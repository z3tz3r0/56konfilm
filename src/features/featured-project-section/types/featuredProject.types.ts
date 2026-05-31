import { BaseBlock, ContentCta, SectionHeading } from '@shared/types';
import { Project } from '@shared/types/project';

type FeaturedProjectsSectionBase = BaseBlock & {
  _type: 'featuredProjectsSection';
  heading?: SectionHeading;
  ctaButton?: ContentCta;
  background?: string;
};

export type FeaturedProjectsSectionBlock =
  | (FeaturedProjectsSectionBase & {
      sourceType: 'latest';
      selectedProjects?: never;
    })
  | (FeaturedProjectsSectionBase & {
      sourceType: 'curated';
      selectedProjects: Project[];
    });
