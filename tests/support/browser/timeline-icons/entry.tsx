import { createRoot, type Root } from 'react-dom/client';
import TimelineSection from '@features/timeline-section/TimelineSection';
import type { TimelineSectionBlock } from '@features/timeline-section/types';
import { MotionProvider } from '@shared/providers/MotionProvider';
import type { Locale, SiteMode } from '@shared/config/preferences';

interface Options {
  mode?: SiteMode;
  lang?: Locale;
  iconState?: 'on' | 'off' | 'missing';
  invalidIcon?: boolean;
}
let root: Root | undefined;
const fixtureWindow = window as typeof window & {
  showTimelineFixture: (options: Options) => void;
};

/** Render real components with translated fixture data; no CMS/network involved. */
fixtureWindow.showTimelineFixture = ({
  mode = 'production',
  lang = 'en',
  iconState = 'on',
  invalidIcon = false,
}) => {
  const titles =
    lang === 'th'
      ? [
          'พูดคุยแนวคิดและเป้าหมาย',
          'วางแผนสร้างสรรค์และเตรียมการผลิตตามรายละเอียดที่ตกลงร่วมกัน',
          'ถ่ายทำและสร้างสรรค์ผลงาน',
          'ส่งมอบผลงานและดูแลต่อเนื่อง',
        ]
      : [
          'Brief & Vision Talk',
          'Creative planning and production with a deliberately longer title',
          'Production & Magic',
          'Delivery & Beyond',
        ];
  const block: TimelineSectionBlock = {
    _type: 'timelineSection',
    ...(iconState === 'missing' ? {} : { hasIcon: iconState === 'on' }),
    heading: {
      eyebrow: lang === 'th' ? 'ขั้นตอน' : 'Process',
      heading: lang === 'th' ? 'วิธีทำงานของเรา' : 'How we work',
      body: lang === 'th' ? 'รายละเอียดจาก CMS' : 'CMS introduction',
      align: 'center',
    },
    steps: [4, 1, 3, 2].map((order) => ({
      _key: `step-${order}`,
      order,
      title: titles[order - 1],
      description:
        lang === 'th'
          ? `รายละเอียดขั้นตอนที่ ${order} เราดูแลทุกขั้นตอนร่วมกับคุณเพื่อให้ได้ผลงานที่ตรงตามเป้าหมาย`
          : `Step ${order} description. We work closely with you to create the final result and preserve every important detail.`,
      icon: { asset: { _ref: 'image-fixture-48x48-png' } },
      iconPicker:
        invalidIcon && order === 1
          ? undefined
          : { name: `mdi:camera-${order}` },
    })),
    cta: {
      label: lang === 'th' ? 'ติดต่อเรา' : 'Contact us',
      linkType: 'internal',
      pageRef: { slug: 'contact' },
      style: 'secondary',
    },
  };
  document.documentElement.dataset.mode = mode;
  document.documentElement.lang = lang;
  root ??= createRoot(document.getElementById('root')!);
  root.render(
    <MotionProvider>
      <TimelineSection block={block} lang={lang} mode={mode} />
      <div style={{ height: 800 }} />
    </MotionProvider>
  );
};
