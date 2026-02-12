import Image from 'next/image';

import SectionShell from '@/components/page/SectionShell';
import { urlFor } from '@/sanity/lib/image';
import { LogoGridSectionBlock } from '@/types/sanity';

interface LogoGridSectionProps {
  block: LogoGridSectionBlock;
}

export default function LogoGridSection({ block }: LogoGridSectionProps) {
  return (
    <SectionShell background={block.background}>
      <div className="container mx-auto space-y-10">
        {block.title ? (
          <h2 className="text-center text-2xl font-medium text-muted-foreground">{block.title}</h2>
        ) : null}
        {block.logos?.length ? (
          <div className="grid items-stretch gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {block.logos.map((logo, index) => {
              if (!logo.image) {
                return null;
              }

              return (
                <div
                  key={logo._key ?? index}
                  className="group border-border/50 bg-background/70 relative mx-auto aspect-square w-full max-w-[180px] overflow-hidden rounded-xl border p-5 opacity-90 transition hover:opacity-100"
                >
                  <Image
                    src={urlFor(logo.image).width(500).fit('max').url()}
                    alt={logo.alt ?? 'Logo'}
                    fill
                    className="object-contain p-2"
                    sizes="(min-width: 1024px) 180px, (min-width: 768px) 160px, 45vw"
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
