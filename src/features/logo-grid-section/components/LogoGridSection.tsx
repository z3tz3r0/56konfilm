import Image from 'next/image';
import { SectionShell } from '@shared/components';
import { urlFor } from '@/sanity/lib/image';
import { LogoGridSectionBlock } from '../types';

interface LogoGridSectionProps {
  block: LogoGridSectionBlock;
}

export default function LogoGridSection({ block }: LogoGridSectionProps) {
  return (
    <SectionShell background={block.background}>
      <div className="container mx-auto">
        {block.title ? (
          <p className="text-muted-foreground mb-12 text-center text-[0.6875rem] font-semibold tracking-[0.3em] uppercase sm:mb-14">
            {block.title}
          </p>
        ) : null}
        {block.logos?.length ? (
          <div className="grid grid-cols-3 place-items-center gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6 md:gap-y-10">
            {block.logos.map((logo, index) => {
              if (!logo.image) return null;
              return (
                <div
                  key={logo._key ?? index}
                  className="relative size-14 opacity-40 transition-opacity duration-500 ease-out hover:opacity-100 sm:size-[4.5rem] md:size-20"
                >
                  <Image
                    src={urlFor(logo.image).width(300).fit('max').url()}
                    alt={logo.alt ?? 'Client logo'}
                    fill
                    className="object-contain"
                    sizes="(min-width: 768px) 80px, (min-width: 640px) 72px, 56px"
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
