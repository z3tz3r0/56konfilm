import { createRoot } from 'react-dom/client';
import PackageComparisonSection from '@features/package-comparison-section/PackageComparisonSection';
import { MotionProvider } from '@shared/providers/MotionProvider';
import { useDeviceTier } from '@shared/hooks/useDeviceTier';
import type { Locale, SiteMode } from '@shared/config/preferences';
import type { PackageComparisonSectionBlock } from '@features/package-comparison-section';
import { comparisonFixture } from '../../../unit/components/packageComparison.fixtures';

interface Options {
  lang: Locale;
  mode: SiteMode;
}

function Fixture({
  block,
  lang,
  mode,
}: Options & { block: PackageComparisonSectionBlock }) {
  const policy = useDeviceTier();
  return (
    <MotionProvider>
      <output
        data-testid='device-policy'
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: 48,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      >
        {JSON.stringify(policy)}
      </output>
      <div style={{ height: 200 }} />
      <PackageComparisonSection block={block} lang={lang} mode={mode} />
      <div style={{ height: 1200 }} />
    </MotionProvider>
  );
}

const fixtureWindow = window as typeof window & {
  showComparisonFixture: (options: Options) => void;
};
fixtureWindow.showComparisonFixture = ({ lang, mode }) => {
  document.documentElement.dataset.mode = mode;
  document.documentElement.lang = lang;
  document.documentElement.style.setProperty('--navbar-visible-height', '48px');
  document.documentElement.style.setProperty(
    '--navbar-transition-duration',
    '0ms'
  );
  const block = comparisonFixture(lang);
  // Realistic long labels and enough rows/columns to exercise overflow and sticky bounds.
  block.groups = block.groups!.map((group) => {
    const rows = Array.from({ length: 16 }, (_, index) => {
      const source = group.rows[index % group.rows.length];
      return {
        ...source,
        _id: `${source._id}-${index}`,
        title: `${source.title} ${index + 1}`,
      };
    });
    const packages = Array.from({ length: 5 }, (_, index) => {
      const source = group.packages[index % group.packages.length];
      return {
        ...source,
        _id: `${source._id}-${index}`,
        title: `${source.title} ${lang === 'th' ? 'แพ็กเกจวันสำคัญ' : 'Celebration collection'} ${index + 1}`,
        serviceIds: rows
          .filter((row) =>
            source.serviceIds?.includes(row._id.replace(/-\d+$/, ''))
          )
          .map((row) => row._id),
      };
    });
    return { ...group, rows, packages };
  });
  createRoot(document.getElementById('root')!).render(
    <Fixture block={block} lang={lang} mode={mode} />
  );
};
