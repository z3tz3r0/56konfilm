import { Locale, SiteMode } from '@shared/config';
import { BaseBlock, ContentCta, MediaItem } from '@shared/types';

interface TwoColumnSectionBlock extends BaseBlock {
  _type: 'twoColumnSection';
  layout?: string;
  sectionVariant: 'standard' | 'emphasized';
  background?: string;
  content: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    align?: string;
  };
  media?: MediaItem;
  ctas?: ContentCta[];
}

// --- Component Props ---
interface TwoColumnSectionProps {
  block: TwoColumnSectionBlock;
  lang: Locale;
  mode: SiteMode;
}

interface TwoColumnByMode extends TwoColumnSectionProps {
  isTextLeft: boolean;
  textColumnOrder: string;
  mediaColumnOrder: string;
  alignClass: string;
}

export type { TwoColumnSectionBlock, TwoColumnSectionProps, TwoColumnByMode };
