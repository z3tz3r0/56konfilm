import { createRoot, type Root } from 'react-dom/client';
import TestimonialSection from '@features/testimonial-section/components/TestimonialSection';
import { MotionProvider } from '@shared/providers/MotionProvider';
import type { Locale, SiteMode } from '@shared/config/preferences';

interface Options {
  mode?: SiteMode;
  lang?: Locale;
  background?: string;
  count?: number;
  minimal?: boolean;
}
let root: Root | undefined;
let renderKey = 0;
const fixtureWindow = window as typeof window & {
  showTestimonialFixture: (options: Options) => Promise<void>;
};

fixtureWindow.showTestimonialFixture = async ({
  mode = 'production',
  lang = 'en',
  background = 'default',
  count = 3,
  minimal = false,
}) => {
  document.documentElement.dataset.mode = mode;
  document.documentElement.lang = lang;
  root ??= createRoot(document.getElementById('root')!);
  root.render(
    <MotionProvider>
      <TestimonialSection
        key={renderKey++}
        block={{
          _type: 'testimonialSection',
          background,
          heading: {
            eyebrow: lang === 'th' ? 'รีวิว' : 'Testimonials',
            heading: lang === 'th' ? 'เสียงจากลูกค้า' : 'What our clients say',
            body:
              lang === 'th'
                ? 'ความไว้วางใจที่เราภูมิใจ'
                : 'Experiences shared by our clients',
          },
          testimonials: Array.from({ length: count }, (_, index) => ({
            _key: `review-${index}`,
            ...(minimal
              ? {}
              : {
                  quote:
                    lang === 'th'
                      ? `ประสบการณ์ที่ประทับใจ ${index + 1} ทีมงานดูแลรายละเอียดทุกขั้นตอนและถ่ายทอดความทรงจำที่มีความหมายอย่างตั้งใจ`
                      : `A memorable experience ${index + 1}. The team carefully captured every meaningful detail and helped us create a story we can cherish.`,
                  authorName:
                    lang === 'th'
                      ? `ผู้รีวิว ${index + 1}`
                      : `Reviewer ${index + 1}`,
                  authorTitle:
                    lang === 'th' ? `บทบาท ${index + 1}` : `Role ${index + 1}`,
                  authorImage: {
                    asset: { _ref: `image-avatar-${index}-48x48-png` },
                  },
                }),
          })),
        }}
      />
    </MotionProvider>
  );
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
};
