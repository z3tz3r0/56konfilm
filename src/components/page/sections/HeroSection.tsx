import { HeroSectionBlock } from '@/types/sanity';
import CtaGroup from '../CtaGroup';
import SectionShell from '../SectionShell';
import ParallaxText from './hero/ParallaxText';

interface HeroSectionProps {
  block: HeroSectionBlock;
}

export default function HeroSection({ block }: HeroSectionProps) {
  return (
    <SectionShell
      className="flex h-screen items-center justify-center"
      media={block.backgroundMedia ?? null}
      overlayClassName="hero-overlay"
      videoPriority={true}
    >
      {block.parallaxText ? (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <ParallaxText>{block.parallaxText}</ParallaxText>
        </div>
      ) : null}

      <div className="container relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-6 text-center text-white">
        {block.title ? (
          <h1 className="text-3xl tracking-tight text-balance md:text-5xl">
            {block.title}
          </h1>
        ) : null}
        {block.tagline ? (
          <p className="text-lg text-white/85 md:text-xl">{block.tagline}</p>
        ) : null}
        {block.ctas ? <CtaGroup ctas={block.ctas} alignment="center" /> : null}
      </div>
    </SectionShell>
  );
}
