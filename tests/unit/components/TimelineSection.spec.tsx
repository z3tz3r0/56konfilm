import {
  createElement,
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScroll, useTransform } from 'motion/react';
import TimelineSection from '@features/timeline-section/TimelineSection';
import TimelineCard from '@features/timeline-section/components/TimelineCard';
import AppIcon from '@shared/components/common/AppIcon';
import CtaGroup from '@shared/components/common/CtaGroup';
import CtaButton from '@shared/components/common/CtaButton';
import SectionHeader from '@shared/components/common/section-header';
import { Card, CardContent } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import type {
  TimelineSectionBlock,
  TimelineStep,
} from '@features/timeline-section/types';
import type { Locale } from '@shared/config/preferences';

const state = vi.hoisted(() => ({
  device: { allowHeavyMotion: true, isInitialized: true },
}));

// Keep the actual cards, icon wrapper, heading and CTA. Browser fixtures below
// cover the real Embla carousel; here its options remain directly inspectable.
vi.mock('@shared/components', () => ({
  Card: (props: ComponentProps<typeof Card>) => <Card {...props} />,
  CardContent: (props: ComponentProps<typeof CardContent>) => (
    <CardContent {...props} />
  ),
  Button: (props: ComponentProps<typeof Button>) => <Button {...props} />,
  AppIcon: (props: ComponentProps<typeof AppIcon>) => <AppIcon {...props} />,
  SectionHeader: (props: ComponentProps<typeof SectionHeader>) => (
    <SectionHeader {...props} />
  ),
  CtaGroup: (props: ComponentProps<typeof CtaGroup>) => <CtaGroup {...props} />,
  CtaButton: (props: ComponentProps<typeof CtaButton>) => (
    <CtaButton {...props} />
  ),
  SectionShell: ({
    children,
    background,
    dataTestId,
  }: {
    children: ReactNode;
    background?: string;
    dataTestId?: string;
  }) => (
    <section data-testid={dataTestId} data-background={background}>
      {children}
    </section>
  ),
  Carousel: ({ children, opts }: { children: ReactNode; opts: unknown }) => (
    <div data-testid='carousel' data-options={JSON.stringify(opts)}>
      {children}
    </div>
  ),
  CarouselContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  CarouselItem: (props: HTMLAttributes<HTMLDivElement>) => <div {...props} />,
}));
vi.mock('@shared/hooks', () => ({ useDeviceTier: () => state.device }));
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className?: string }) => (
    <svg
      role='img'
      data-testid='fixture-icon'
      data-icon-name={icon}
      className={className}
    />
  ),
}));
vi.mock('next/link', () => ({
  default: (props: ComponentProps<'a'>) => <a {...props} />,
}));
vi.mock('next/image', () => ({
  default: () => {
    throw new Error('Timeline must not render legacy images');
  },
}));
vi.mock('@/sanity/lib/image', () => ({
  getImageUrl: () => {
    throw new Error('Timeline must not request CMS image URLs');
  },
}));
vi.mock('motion/react', () => ({
  useScroll: vi.fn(() => ({ scrollYProgress: 0 })),
  useTransform: vi.fn(() => '0%'),
  m: {
    div: ({
      initial,
      whileInView,
      viewport,
      transition,
      ...props
    }: HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      whileInView?: unknown;
      viewport?: unknown;
      transition?: unknown;
    }) =>
      createElement('div', {
        ...props,
        'data-initial': JSON.stringify(initial),
        'data-in-view': JSON.stringify(whileInView),
        'data-viewport': JSON.stringify(viewport),
        'data-transition': JSON.stringify(transition),
      }),
  },
}));

beforeEach(() => {
  state.device = { allowHeavyMotion: true, isInitialized: true };
  vi.clearAllMocks();
});
afterEach(cleanup);

/** Build localized, unsorted steps with both picker icons and legacy image data. */
function fixture(lang: Locale, hasIcon?: boolean): TimelineSectionBlock {
  return {
    _type: 'timelineSection',
    hasIcon,
    background: 'muted',
    heading: {
      eyebrow: lang === 'th' ? 'ขั้นตอน' : 'Process',
      heading: lang === 'th' ? 'วิธีทำงานของเรา' : 'How we work',
      body: lang === 'th' ? 'รายละเอียดจาก CMS' : 'CMS introduction',
      align: 'center',
    },
    steps: [3, 1, 2].map((order) => ({
      _key: `step-${order}`,
      order,
      title: `${lang === 'th' ? 'ขั้นตอน' : 'Step'} ${order}`,
      description: `${lang === 'th' ? 'รายละเอียด' : 'Description'} ${order}`,
      icon: { asset: { _ref: 'image-legacy-48x48-png' } },
      iconPicker: { name: `mdi:camera-${order}` },
    })),
    cta: {
      label: lang === 'th' ? 'ติดต่อเรา' : 'Contact us',
      linkType: 'internal',
      pageRef: { slug: 'contact' },
      style: 'secondary',
    },
  };
}

describe('Timeline section icon controls', () => {
  for (const mode of ['production', 'wedding'] as const) {
    for (const lang of ['en', 'th'] as const) {
      it.each([true, false, undefined])(
        `uses one toggle for every ${mode}/${lang} desktop and mobile card (%s)`,
        (hasIcon) => {
          const block = fixture(lang, hasIcon);
          const before = structuredClone(block);
          render(<TimelineSection block={block} lang={lang} mode={mode} />);
          expect(screen.getByTestId('timeline-section')).toHaveAttribute(
            'data-background',
            'muted'
          );
          expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
            block.heading.heading!
          );
          for (const id of ['timeline-desktop', 'timeline-mobile']) {
            const layout = within(screen.getByTestId(id));
            expect(
              layout
                .getAllByRole('heading', { level: 3 })
                .map((item) => item.textContent)
            ).toEqual(
              [1, 2, 3].map(
                (order) => `${lang === 'th' ? 'ขั้นตอน' : 'Step'} ${order}`
              )
            );
            const cards = layout.getAllByTestId('timeline-card');
            cards.forEach((card, index) => {
              expect(card).toHaveTextContent(
                `${lang === 'th' ? 'รายละเอียด' : 'Description'} ${index + 1}`
              );
              const icons = within(card).queryAllByTestId('fixture-icon');
              expect(icons).toHaveLength(hasIcon ? 1 : 0);
              if (hasIcon) {
                expect(icons[0]).toHaveAttribute(
                  'data-icon-name',
                  `mdi:camera-${index + 1}`
                );
                expect(
                  icons[0].closest('[data-slot="app-icon"]')
                ).toHaveAttribute('data-variant', 'plain');
                expect(icons[0].closest('[aria-hidden="true"]')).not.toBeNull();
              }
              expect(within(card).queryByRole('img')).not.toBeInTheDocument();
            });
          }
          expect(screen.getByTestId('carousel')).toHaveAttribute(
            'data-options',
            JSON.stringify({ align: 'start', loop: false })
          );
          expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            `/${lang}/${mode}/contact`
          );
          expect(block).toEqual(before);
        }
      );
      it(`preserves an external CTA for ${mode}/${lang}`, () => {
        const block = fixture(lang, true);
        block.cta = {
          ...block.cta!,
          linkType: 'external',
          externalUrl: 'https://example.com/contact',
        };
        render(<TimelineSection block={block} lang={lang} mode={mode} />);
        expect(screen.getByRole('link')).toHaveAttribute(
          'href',
          'https://example.com/contact'
        );
        expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
        expect(screen.getByRole('link')).toHaveAttribute(
          'rel',
          'noopener noreferrer'
        );
      });
    }
  }
  it('hides and restores every icon after changing the section toggle without changing data', () => {
    const block = fixture('en', true);
    const before = structuredClone(block.steps);
    const { rerender } = render(
      <TimelineSection block={block} lang='en' mode='production' />
    );
    expect(screen.getAllByTestId('fixture-icon')).toHaveLength(6);
    rerender(
      <TimelineSection
        block={{ ...block, hasIcon: false }}
        lang='en'
        mode='production'
      />
    );
    expect(screen.queryAllByTestId('fixture-icon')).toHaveLength(0);
    rerender(<TimelineSection block={block} lang='en' mode='production' />);
    expect(screen.getAllByTestId('fixture-icon')).toHaveLength(6);
    expect(block.steps).toEqual(before);
  });
  it.each([undefined, []])(
    'handles a missing or empty step list (%j)',
    (steps) => {
      render(
        <TimelineSection
          block={{ ...fixture('en', true), steps }}
          lang='en'
          mode='wedding'
        />
      );
      expect(screen.queryAllByTestId('timeline-card')).toHaveLength(0);
      expect(screen.getByRole('link')).toBeInTheDocument();
    }
  );
  it.each([undefined, null, {}, { name: '' }, { name: ' \n ' }, { name: 42 }])(
    'skips invalid picker data without rendering an image fallback (%j)',
    (iconPicker) => {
      const step = {
        ...fixture('en', true).steps![0],
        iconPicker,
      } as unknown as TimelineStep;
      render(<TimelineCard step={step} index={0} hasIcon />);
      expect(screen.queryByTestId('fixture-icon')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(
        screen
          .getByTestId('timeline-card')
          .querySelector('[aria-hidden="true"] + div')?.children
      ).toHaveLength(1);
    }
  );
  it('trims a selected icon name without modifying its stored value', () => {
    const step = { title: 'Title', iconPicker: { name: ' mdi:camera ' } };
    render(<TimelineCard step={step} index={4} hasIcon />);
    expect(screen.getByTestId('fixture-icon')).toHaveAttribute(
      'data-icon-name',
      'mdi:camera'
    );
    expect(step.iconPicker.name).toBe(' mdi:camera ');
    expect(screen.getByTestId('timeline-card')).toHaveTextContent('5');
  });
  it('preserves optional card content and the supplied card class', () => {
    render(
      <TimelineCard step={{}} index={1} className='fixture-card' hasIcon />
    );
    expect(screen.getByTestId('timeline-card')).toHaveClass('fixture-card');
    expect(screen.getByTestId('timeline-card')).toHaveTextContent('2');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
  it('does not require a CTA', () => {
    render(
      <TimelineSection
        block={{ ...fixture('en', false), cta: undefined }}
        lang='en'
        mode='production'
      />
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('Timeline animation regression', () => {
  it.each([true, false])(
    'keeps scroll and connector settings when hasIcon is %s',
    (hasIcon) => {
      render(
        <TimelineSection
          block={fixture('en', hasIcon)}
          lang='en'
          mode='production'
        />
      );
      expect(useScroll).toHaveBeenCalledWith(
        expect.objectContaining({ offset: ['start 80%', 'center center'] })
      );
      expect(useTransform).toHaveBeenCalledWith(
        0,
        [0, 0.2, 0.5, 0.8, 1],
        ['0%', '5%', '25%', '65%', '100%']
      );
      const firstRow = screen
        .getByTestId('timeline-desktop')
        .querySelector('li')!;
      expect(firstRow).toHaveClass('flex-row');
      expect(firstRow.nextElementSibling).toHaveClass('flex-row-reverse');
      const connector = firstRow.querySelector('[data-initial]')!;
      expect(connector).toHaveAttribute(
        'data-initial',
        JSON.stringify({ width: '0%' })
      );
      expect(connector).toHaveAttribute(
        'data-in-view',
        JSON.stringify({ width: '100%' })
      );
      expect(connector).toHaveAttribute(
        'data-viewport',
        JSON.stringify({ once: true, margin: '-20% 0px -40% 0px' })
      );
    }
  );
  it('keeps the existing static main line for lite motion while showing selected icons', () => {
    state.device = { allowHeavyMotion: false, isInitialized: true };
    render(
      <TimelineSection
        block={fixture('en', true)}
        lang='en'
        mode='production'
      />
    );
    const desktop = screen.getByTestId('timeline-desktop');
    expect(desktop.firstElementChild?.firstElementChild).not.toHaveAttribute(
      'data-initial'
    );
    expect(desktop.firstElementChild?.firstElementChild).toHaveClass('h-full');
    expect(within(desktop).getAllByTestId('fixture-icon')).toHaveLength(3);
  });
});
