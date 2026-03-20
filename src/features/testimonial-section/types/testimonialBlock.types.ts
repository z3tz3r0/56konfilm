import { SanityImageSource } from '@sanity/image-url';
import { BaseBlock } from '@shared/types';

export interface TestimonialSectionBlock extends BaseBlock {
  _type: 'testimonialSection';
  background?: string;
  heading?: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    align?: string;
  };
  testimonials?: Array<{
    _key?: string;
    quote?: string;
    authorName?: string;
    authorTitle?: string;
    authorImage?: SanityImageSource;
  }>;
}
