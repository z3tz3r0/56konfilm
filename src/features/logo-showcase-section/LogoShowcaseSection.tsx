import { SectionHeader, SectionShell } from '@shared/components';
import type { Locale } from '@shared/config/preferences';
import { urlFor } from '@/sanity/lib/image';
import LogoShowcaseLogos from './components/LogoShowcaseLogos';
import type {
  LogoShowcaseSectionBlock,
  ShowcaseLogo,
} from './types/logoShowcase.types';

interface LogoShowcaseSectionProps {
  block: LogoShowcaseSectionBlock;
  lang: Locale;
}

/** Keep CMS image preparation and the standard section heading on the server. */
export default function LogoShowcaseSection({
  block,
  lang,
}: LogoShowcaseSectionProps) {
  const heading = {
    ...block.heading,
    heading: block.heading?.heading || block.title || '',
    align: block.heading?.align ?? ('center' as const),
  };
  const logos: ShowcaseLogo[] = (block.logos ?? []).flatMap((logo, index) =>
    logo.image
      ? [
          {
            id: logo._key ?? `logo-${index}`,
            src: urlFor(logo.image).width(300).fit('max').url(),
            alt: logo.alt ?? '',
          },
        ]
      : []
  );

  return (
    <SectionShell
      background={block.background}
      sanityType='logoShowcaseSection'
      dataTestId='logo-showcase-section'
      contentWrapperClass='flex flex-col gap-8'
    >
      <SectionHeader heading={heading} />
      {logos.length > 0 && <LogoShowcaseLogos logos={logos} lang={lang} />}
    </SectionShell>
  );
}
