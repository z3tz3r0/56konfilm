import { createRoot, type Root } from 'react-dom/client';
import PhilosophySection from '@features/philosophy-section/components/PhilosophySection';
import { MotionProvider } from '@shared/providers/MotionProvider';
import type { Locale, SiteMode } from '@shared/config/preferences';

interface Options {
  mode?: SiteMode;
  lang?: Locale;
  quote?: string;
  background?: string;
}
let root: Root | undefined;
const fixtureWindow = window as typeof window & {
  showPhilosophyFixture: (options: Options) => void;
};

fixtureWindow.showPhilosophyFixture = ({
  mode = 'production',
  lang = 'en',
  quote,
  background = 'muted',
}) => {
  document.documentElement.dataset.mode = mode;
  document.documentElement.lang = lang;
  root ??= createRoot(document.getElementById('root')!);
  root.render(
    <MotionProvider>
      <PhilosophySection
        block={{
          _type: 'philosophySection',
          background,
          quote:
            quote ??
            (lang === 'en'
              ? '[Every budget matters]\nbecause it reflects the trust\npeople place in us.'
              : '[ทุกความไว้วางใจสำคัญ]\nเราดูแลทุกผลงานด้วยความตั้งใจ\nเพื่อสร้างความทรงจำที่มีความหมาย'),
        }}
      />
    </MotionProvider>
  );
};
