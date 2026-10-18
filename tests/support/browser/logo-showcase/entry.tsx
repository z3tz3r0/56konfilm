import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server.browser';
import LogoShowcaseSection from '@features/logo-showcase-section/LogoShowcaseSection';
import SectionHeader from '@shared/components/common/section-header';
import type { Locale, SiteMode } from '@shared/config/preferences';
import type { LogoShowcaseSectionBlock } from '@features/logo-showcase-section';

interface Options {
  count?: number;
  lang?: Locale;
  mode?: SiteMode;
  hydrate?: boolean;
}
let root: Root | undefined;
let element: React.ReactElement;

/** Serve only embedded fixture SVGs: these deliberately exercise different image ratios. */
function logo(index: number) {
  const width = [120, 36, 72][index % 3];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="36"><rect width="${width}" height="36" rx="4" fill="#888"/><text x="5" y="24" fill="white">${index + 1}</text></svg>`;
  return {
    _key: `logo-${index}`,
    alt: `Brand ${index}`,
    image: { src: `data:image/svg+xml,${encodeURIComponent(svg)}` },
  };
}

const fixtureWindow = window as typeof window & {
  showLogoFixture: (options: Options) => void;
  hydrateLogoFixture: () => void;
};
fixtureWindow.showLogoFixture = ({
  count = 13,
  lang = 'en',
  mode = 'production',
  hydrate = true,
}) => {
  root?.unmount();
  root = undefined;
  const container = document.getElementById('root')!;
  const block = {
    _type: 'logoShowcaseSection',
    background: 'default',
    heading: {
      eyebrow: 'Our clients',
      heading: lang === 'th' ? 'ลูกค้าที่ไว้วางใจเรา' : 'Brands that trust us',
      body: 'CMS introduction',
    },
    logos: Array.from({ length: count }, (_, index) => logo(index)),
  } as unknown as LogoShowcaseSectionBlock;
  document.documentElement.dataset.mode = mode;
  document.documentElement.lang = lang;
  element = (
    <>
      <div style={{ height: 20 }} />
      <LogoShowcaseSection block={block} lang={lang} />
      <div id='typography-reference'>
        <SectionHeader heading={block.heading} />
      </div>
      <div style={{ height: 1600 }} />
    </>
  );
  if (hydrate) {
    root = createRoot(container);
    root.render(element);
  } else {
    container.innerHTML = renderToString(element);
  }
};
fixtureWindow.hydrateLogoFixture = () => {
  root = hydrateRoot(document.getElementById('root')!, element);
};
