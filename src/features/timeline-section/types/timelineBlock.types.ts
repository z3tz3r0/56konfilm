import type { SanityImageSource } from '@sanity/image-url';
import type { BaseBlock, ContentCta, SectionHeading } from '@shared/types';

interface TimelineSectionBlock extends BaseBlock {
  _type: 'timelineSection';
  background?: string;
  hasIcon?: boolean;
  heading: SectionHeading;
  steps?: Array<{
    _key?: string;
    order?: number;
    title?: string;
    description?: string;
    icon?: SanityImageSource;
    iconPicker?: { name: string };
  }>;
  cta?: ContentCta;
}

type TimelineStep = NonNullable<TimelineSectionBlock['steps']>[number];

export type { TimelineSectionBlock, TimelineStep };
