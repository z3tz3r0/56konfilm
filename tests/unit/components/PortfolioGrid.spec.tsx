import { cleanup, render, screen } from '@testing-library/react';
import { createElement, type HTMLAttributes, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PortfolioGrid from '@shared/components/common/portfolio-grid/PortfolioGrid';
import {
  staggerContainerVariants,
  fadeUpItemVariants,
} from '@shared/lib/motion';
import type { Project } from '@shared/types';

const tier = vi.hoisted(() => ({
  allowHeavyMotion: true,
  isInitialized: true,
}));

vi.mock('@shared/hooks', () => ({ useDeviceTier: () => tier }));
vi.mock('motion/react', () => {
  const component = (tag: string) =>
    function MotionMock({
      children,
      initial,
      whileInView,
      viewport,
      variants,
      ...props
    }: HTMLAttributes<HTMLElement> & {
      children?: ReactNode;
      initial?: string;
      whileInView?: string;
      viewport?: unknown;
      variants?: unknown;
    }) {
      return createElement(
        tag,
        {
          ...props,
          'data-motion': tag,
          'data-initial': initial,
          'data-while-in-view': whileInView,
          'data-viewport': JSON.stringify(viewport),
          'data-variants': JSON.stringify(variants),
        },
        children
      );
    };
  return {
    m: { section: component('section'), div: component('div') },
  };
});
vi.mock('next/link', () => ({
  default: ({ children, ...props }: HTMLAttributes<HTMLAnchorElement>) =>
    createElement('a', props, children),
}));
vi.mock('next/image', () => ({
  default: ({ fill, ...props }: { fill?: boolean }) => {
    void fill;
    return createElement('img', props);
  },
}));
vi.mock('@/sanity/lib/image', () => ({
  urlFor: () => {
    const builder = {
      width: () => builder,
      height: () => builder,
      fit: () => builder,
      url: () => '/mock-project.jpg',
    };
    return builder;
  },
}));

const project = (id: string): Project => ({
  _id: id,
  title: `Project ${id}`,
  slug: id,
  siteMode: ['production', 'wedding'],
  projectDate: '2026-01-01',
});

const props = {
  projects: [project('first'), project('second')],
  lang: 'en' as const,
  mode: 'production' as const,
  portfolioSlug: 'work',
};

describe('PortfolioGrid reveal', () => {
  beforeEach(() => {
    tier.allowHeavyMotion = true;
    tier.isInitialized = true;
  });
  afterEach(cleanup);

  it('reuses Gallery variants and reveals once when the grid enters the viewport', () => {
    const { container } = render(<PortfolioGrid {...props} />);
    const grid = container.firstElementChild!;
    expect(grid).toHaveAttribute('data-initial', 'hidden');
    expect(grid).toHaveAttribute('data-while-in-view', 'visible');
    expect(grid).toHaveAttribute(
      'data-viewport',
      JSON.stringify({ once: true, margin: '-100px' })
    );
    expect(grid).toHaveAttribute(
      'data-variants',
      JSON.stringify(staggerContainerVariants)
    );
    expect(grid).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'gap-8'
    );
    for (const wrapper of grid.children) {
      expect(wrapper).toHaveClass('row-span-2', 'grid', 'grid-rows-subgrid');
      expect(wrapper).toHaveAttribute(
        'data-variants',
        JSON.stringify(fadeUpItemVariants)
      );
    }
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(
      ['No Image2026Project first', 'No Image2026Project second']
    );
  });

  it.each(['production', 'wedding'] as const)(
    'retains project links, images and card subgrid in %s',
    (mode) => {
      const withImage = {
        ...project('image'),
        coverImage: {
          asset: { _type: 'reference' as const, _ref: 'image-test' },
        },
      };
      render(
        <PortfolioGrid
          {...props}
          projects={[withImage]}
          lang='th'
          mode={mode}
        />
      );
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        `/th/${mode}/work/image`
      );
      expect(screen.getByRole('link')).toHaveClass(
        'row-span-2',
        'grid-rows-subgrid'
      );
      expect(
        screen.getByRole('img', { name: 'Project image' })
      ).toHaveAttribute('src', '/mock-project.jpg');
    }
  );

  it('keeps an unchanged ordered list mounted after a server rerender or limit URL sync', () => {
    const { container, rerender } = render(<PortfolioGrid {...props} />);
    const original = container.firstElementChild;
    rerender(
      <PortfolioGrid
        {...props}
        projects={props.projects.map((item) => ({ ...item }))}
      />
    );
    expect(container.firstElementChild).toBe(original);
  });

  it.each([
    ['new page', [project('third'), project('fourth')]],
    ['new filter', [project('second')]],
    ['new limit', [...props.projects, project('third')]],
    ['new order', [...props.projects].reverse()],
  ])(
    'remounts the reveal for %s and when returning to the previous set',
    (_label, projects) => {
      const { container, rerender } = render(<PortfolioGrid {...props} />);
      const original = container.firstElementChild;
      rerender(<PortfolioGrid {...props} projects={projects as Project[]} />);
      const changed = container.firstElementChild;
      expect(changed).not.toBe(original);
      rerender(<PortfolioGrid {...props} />);
      expect(container.firstElementChild).not.toBe(changed);
    }
  );

  it.each([
    { lang: 'th' as const },
    { mode: 'wedding' as const },
    { portfolioSlug: 'films' },
  ])('resets the reveal when route context changes: %j', (context) => {
    const { container, rerender } = render(<PortfolioGrid {...props} />);
    const original = container.firstElementChild;
    rerender(<PortfolioGrid {...props} {...context} />);
    expect(container.firstElementChild).not.toBe(original);
  });

  it.each([{ projects: [] }, { projects: [project('single')] }])(
    'supports empty and single-item lists: %j',
    ({ projects }) => {
      const { container } = render(
        <PortfolioGrid {...props} projects={projects} />
      );
      expect(container.firstElementChild?.children).toHaveLength(
        projects.length
      );
    }
  );

  it('uses static, directly rendered cards on low-tier or reduced-motion devices', () => {
    tier.allowHeavyMotion = false;
    const { container } = render(<PortfolioGrid {...props} />);
    const grid = container.firstElementChild!;
    expect(grid).not.toHaveAttribute('data-motion');
    expect(grid.querySelector('[data-motion]')).toBeNull();
    expect(grid.children).toHaveLength(2);
    expect(grid.firstElementChild?.tagName).toBe('A');
  });

  it('removes hidden animation wrappers after low-tier initialization without changing order', () => {
    tier.allowHeavyMotion = false;
    tier.isInitialized = false;
    const { container, rerender } = render(<PortfolioGrid {...props} />);
    expect(container.firstElementChild).toHaveAttribute(
      'data-initial',
      'hidden'
    );
    tier.isInitialized = true;
    rerender(<PortfolioGrid {...props} />);
    expect(container.querySelector('[data-initial]')).toBeNull();
    expect(
      screen.getAllByRole('heading').map((heading) => heading.textContent)
    ).toEqual(['Project first', 'Project second']);
  });
});
