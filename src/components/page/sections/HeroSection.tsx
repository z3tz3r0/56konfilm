import { HeroSectionBlock } from '@/types/sanity';
import CtaGroup from '../CtaGroup';
import SectionShell from '../SectionShell';

interface HeroSectionProps {
  block: HeroSectionBlock;
}

export default function HeroSection({ block }: HeroSectionProps) {
  return (
    <SectionShell
      className="flex items-center justify-center"
      media={block.backgroundMedia ?? null}
      overlayClassName="bg-gradient-to-b from-black/70 via-black/40 to-black/75"
    >
      <div className="container mx-auto flex max-w-3xl flex-col items-center gap-6 text-center text-white">
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
