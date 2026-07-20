import { SanityImageSource } from '@sanity/image-url';
import { BaseBlock, ContentCta, SectionHeading } from '@shared/types';

interface TimelineSectionBlock extends BaseBlock {
  _type: 'timelineSection';
  background?: string;
  heading: SectionHeading;
  steps?: Array<{
    _key?: string;
    order?: number;
    title?: string;
    description?: string;
    icon?: SanityImageSource;
  }>;
  cta?: ContentCta;
}

type TimelineStep = NonNullable<TimelineSectionBlock['steps']>[number];

export type { TimelineSectionBlock, TimelineStep };
