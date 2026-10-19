// Keep the actual layout, CTA, icon wrapper and Embla provider/consumers.
export { Card, CardContent } from '@shared/components/ui/card';
export { Button } from '@shared/components/ui/button';
export {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@shared/components/ui/carousel';
export { default as AppIcon } from '@shared/components/common/AppIcon';
export { default as CtaButton } from '@shared/components/common/CtaButton';
export { default as CtaGroup } from '@shared/components/common/CtaGroup';
export { default as SectionShell } from '@shared/components/common/SectionShell';
export { default as SectionHeader } from '@shared/components/common/section-header';
/** Omit unrelated video playback from the offline timeline fixture. */
export const VideoLoop = () => null;
