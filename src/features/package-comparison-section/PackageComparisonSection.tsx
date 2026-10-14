import { SectionHeader, SectionShell } from '@shared/components';
import type { Locale, SiteMode } from '@shared/config/preferences';
import PackageComparison from './components/PackageComparison';
import type { PackageComparisonSectionBlock } from './types/packageComparisonBlock.types';
import styles from './packageComparison.module.css';
import { cn } from '@shared/utils/styling/tailwindUtils';

interface PackageComparisonSectionProps {
  block: PackageComparisonSectionBlock;
  lang: Locale;
  mode: SiteMode;
}

export default function PackageComparisonSection({
  block,
  lang,
  mode,
}: PackageComparisonSectionProps) {
  const groups = (block.groups ?? []).filter(
    (group) =>
      group?._key &&
      group.label?.trim() &&
      group.packages?.length &&
      group.rows?.length
  );
  if (!groups.length) return null;

  const heading = block.heading
    ? { ...block.heading, align: block.heading.align ?? ('center' as const) }
    : undefined;

  return (
    <SectionShell
      sanityType={block._type}
      dataTestId='package-comparison-section'
      disablePadding
      className={cn('py-16', styles.section)}
      contentWrapperClass='flex w-full max-w-none min-w-0 flex-col gap-8'
    >
      <SectionHeader
        heading={heading}
        className={cn(styles.content, 'gap-4')}
        headingClassName='text-4xl font-bold md:text-5xl'
        bodyClassName='text-text-secondary max-w-none'
      />
      <PackageComparison
        sectionKey={block._key}
        groups={groups}
        lang={lang}
        mode={mode}
        caption={heading?.heading}
      />
    </SectionShell>
  );
}
