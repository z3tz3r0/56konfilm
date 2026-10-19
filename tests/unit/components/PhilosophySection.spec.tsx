import { createElement, type ComponentProps, type HTMLAttributes } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PhilosophySection from '@features/philosophy-section/components/PhilosophySection';
import type { PhilosophySectionBlock } from '@features/philosophy-section/types';
import AppIcon from '@shared/components/common/AppIcon';
import HighlightedText from '@shared/components/common/HighlightedText';
import SectionShell from '@shared/components/common/SectionShell';

// Keep the shared implementations real without loading unrelated barrel modules.
vi.mock('@shared/components', () => ({
  AppIcon: (props: ComponentProps<typeof AppIcon>) => <AppIcon {...props} />,
  HighlightedText: (props: ComponentProps<typeof HighlightedText>) => (
    <HighlightedText {...props} />
  ),
  SectionShell: (props: ComponentProps<typeof SectionShell>) => (
    <SectionShell {...props} />
  ),
  VideoLoop: () => null,
}));
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className?: string }) => (
    <svg
      role='img'
      data-testid='quote-icon'
      data-icon-name={icon}
      className={className}
    />
  ),
}));
vi.mock('@/sanity/lib/image', () => ({
  urlFor: () => {
    throw new Error('Philosophy must not request CMS media');
  },
}));
vi.mock('next/image', () => ({
  default: () => {
    throw new Error('Philosophy must not render images');
  },
}));
vi.mock('motion/react', () => ({
  m: {
    blockquote: ({
      initial,
      whileInView,
      viewport,
      transition,
      ...props
    }: HTMLAttributes<HTMLElement> & {
      initial?: unknown;
      whileInView?: unknown;
      viewport?: unknown;
      transition?: unknown;
    }) =>
      createElement('blockquote', {
        ...props,
        'data-initial': JSON.stringify(initial),
        'data-in-view': JSON.stringify(whileInView),
        'data-viewport': JSON.stringify(viewport),
        'data-transition': JSON.stringify(transition),
      }),
  },
}));
afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-mode');
});

function fixture(quote?: string, background?: string): PhilosophySectionBlock {
  return { _type: 'philosophySection', quote, background };
}

describe('Philosophy quote presentation', () => {
  for (const mode of ['production', 'wedding'] as const) {
    it.each([
      {
        lang: 'en',
        quote: '[Every budget matters]\nbecause people trust us.',
        expected: 'Every budget matters\nbecause people trust us.',
      },
      {
        lang: 'th',
        quote: '[ทุกความไว้วางใจสำคัญ]\nเราดูแลทุกผลงานด้วยความตั้งใจ',
        expected: 'ทุกความไว้วางใจสำคัญ\nเราดูแลทุกผลงานด้วยความตั้งใจ',
      },
    ])(
      `uses shared highlighting and fixed decorative quotes for ${mode}/$lang`,
      ({ quote, expected }) => {
        document.documentElement.dataset.mode = mode;
        const block = fixture(quote, 'muted');
        const before = structuredClone(block);
        render(<PhilosophySection block={block} />);
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading.textContent).toBe(expected);
        expect(
          heading.querySelector('span.dark\\:text-primary')
        ).toHaveTextContent(quote.split(']')[0].slice(1));
        expect(
          screen
            .getAllByTestId('quote-icon')
            .map((icon) => icon.getAttribute('data-icon-name'))
        ).toEqual(['bi:quote', 'bi:quote']);
        for (const id of [
          'philosophy-opening-quote',
          'philosophy-closing-quote',
        ]) {
          const wrapper = screen.getByTestId(id);
          expect(wrapper).toHaveAttribute('aria-hidden', 'true');
          expect(
            wrapper.querySelector('[data-slot="app-icon"]')
          ).toHaveAttribute('data-variant', 'plain');
        }
        expect(
          screen.getByTestId('philosophy-closing-quote').firstElementChild
        ).toHaveClass('rotate-180');
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        expect(screen.getByTestId('philosophy-quote').tagName).toBe(
          'BLOCKQUOTE'
        );
        expect(block).toEqual(before);
      }
    );
  }
  it.each([undefined, 'default', 'muted', 'contrast'])(
    'preserves CMS background selection (%s) without forcing the Figma background',
    (background) => {
      render(<PhilosophySection block={fixture('CMS quote', background)} />);
      const section = screen.getByTestId('philosophy-section');
      expect(section).toHaveAttribute('data-sanity-type', 'philosophySection');
      if (!background || background === 'default')
        expect(section).toHaveClass('bg-background');
      if (background === 'muted') expect(section).toHaveClass('bg-secondary');
      if (background === 'contrast')
        expect(section).toHaveClass('bg-primary', 'text-primary-foreground');
    }
  );
  it.each([undefined, '', ' \n\t '])(
    'does not leave floating icons for an empty quote (%j)',
    (quote) => {
      render(<PhilosophySection block={fixture(quote)} />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.queryAllByTestId('quote-icon')).toHaveLength(0);
      expect(screen.getByTestId('philosophy-quote')).toBeEmptyDOMElement();
    }
  );
  it('keeps literal CMS copy when no highlight brackets are present', () => {
    render(
      <PhilosophySection block={fixture('ข้อความจาก CMS ที่ไม่มีการไฮไลต์')} />
    );
    expect(screen.getByRole('heading').textContent).toBe(
      'ข้อความจาก CMS ที่ไม่มีการไฮไลต์'
    );
    expect(screen.getByRole('heading').querySelector('[class]')).toBeNull();
  });
  it('uses font-size-only utilities without setting a line height on the quote or heading', () => {
    render(<PhilosophySection block={fixture('Quote')} />);
    expect(screen.getByRole('heading')).toHaveClass(
      'text-[24px]',
      'md:text-[40px]'
    );
    for (const element of [
      screen.getByTestId('philosophy-quote'),
      screen.getByRole('heading'),
    ]) {
      expect(element.className).not.toMatch(
        /leading-|text-(?:2xl|3xl|4xl|5xl)/
      );
      expect(element.style.lineHeight).toBe('');
    }
  });
  it('preserves the existing reveal configuration and quote test ID', () => {
    render(<PhilosophySection block={fixture('Quote')} />);
    const quote = screen.getByTestId('philosophy-quote');
    expect(quote).toHaveAttribute(
      'data-initial',
      JSON.stringify({ opacity: 0, y: 16 })
    );
    expect(quote).toHaveAttribute(
      'data-in-view',
      JSON.stringify({ opacity: 1, y: 0 })
    );
    expect(quote).toHaveAttribute(
      'data-viewport',
      JSON.stringify({ once: true, margin: '-100px' })
    );
    expect(quote).toHaveAttribute(
      'data-transition',
      JSON.stringify({ duration: 0.8, ease: 'easeOut' })
    );
  });
});
