import type { BaseBlock, MediaItem, SectionHeading } from '@shared/types';

export interface LogoShowcaseSectionBlock extends BaseBlock {
  _type: 'logoShowcaseSection';
  background?: string;
  heading?: SectionHeading;
  /** Legacy content is retained until editors provide the standard heading. */
  title?: string;
  logos?: MediaItem[];
}

export interface ShowcaseLogo {
  id: string;
  src: string;
  alt: string;
}
