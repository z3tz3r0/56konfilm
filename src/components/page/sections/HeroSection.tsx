import { HeroSectionBlock } from '@/types/sanity';
import CtaGroup from '../CtaGroup';
import SectionShell from '../SectionShell';
import ParallaxText from './hero/ParallaxText';

interface HeroSectionProps {
  block: HeroSectionBlock;
  metadata?: {
    client?: string;
    year?: string;
    services?: string[];
  };
}

export default function HeroSection({ block, metadata }: HeroSectionProps) {
  return (
    <SectionShell
      className="flex h-screen items-center justify-center"
      media={block.backgroundMedia ?? null}
      overlayClassName="hero-overlay"
      videoPriority={true}
      enableVideoObserver={true}
      sanityType={block._type}
    >
      {block.parallaxText ? (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <ParallaxText>{block.parallaxText}</ParallaxText>
        </div>
      ) : null}

      <div className="container relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-6 text-center text-white">
        {/* Project Metadata */}
        {metadata && (metadata.client || metadata.year) && (
          <div className="animate-fade-in-up mb-2 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-white/70 md:text-base">
            {metadata.client && <span data-testid="project-client">{metadata.client}</span>}
            {metadata.client && metadata.year && <span>•</span>}
            {metadata.year && <span data-testid="project-year">{metadata.year}</span>}
          </div>
        )}

        {block.title ? (
          <h1 className="text-3xl tracking-tight text-balance md:text-5xl">
            {block.title}
          </h1>
        ) : null}

        {/* Services */}
        {metadata?.services && metadata.services.length > 0 && (
          <div
            className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-white/80"
            data-testid="project-services"
          >
            {metadata.services.map((service, index) => (
              <span key={index} className="uppercase tracking-wide">
                {service}
              </span>
            ))}
          </div>
        )}

        {block.tagline ? (
          <p className="text-lg text-white/85 md:text-xl">{block.tagline}</p>
        ) : null}
        {block.ctas ? <CtaGroup ctas={block.ctas} alignment="center" /> : null}
      </div>
    </SectionShell>
  );
}
