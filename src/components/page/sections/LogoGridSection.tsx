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
      <div className="container space-y-10">
        {block.title ? (
          <h2 className="text-center text-2xl font-medium text-muted-foreground">{block.title}</h2>
        ) : null}
        {block.logos?.length ? (
          <div className="grid items-center justify-items-center gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {block.logos.map((logo, index) => {
              if (!logo.image) {
                return null;
              }

              return (
                <div
                  key={logo._key ?? index}
                  className="relative flex h-16 w-40 items-center justify-center opacity-80 transition hover:opacity-100"
                >
                  <Image
                    src={urlFor(logo.image).width(320).height(128).fit('clip').url()}
                    alt={logo.alt ?? 'Logo'}
                    fill
                    className="object-contain"
                    sizes="160px"
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
