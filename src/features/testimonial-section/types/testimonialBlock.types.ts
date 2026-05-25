import { SanityImageSource } from '@sanity/image-url';
import { BaseBlock, SectionHeading } from '@shared/types';

export interface TestimonialSectionBlock extends BaseBlock {
  _type: 'testimonialSection';
  background?: string;
  heading?: SectionHeading;
  testimonials?: Array<{
    _key?: string;
    quote?: string;
    authorName?: string;
    authorTitle?: string;
    authorImage?: SanityImageSource;
  }>;
}
