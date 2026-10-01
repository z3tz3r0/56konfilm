import { cleanup, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FeaturedProjectSection from '@features/featured-project-section/FeaturedProjectSection';
import PortfolioPage from '@/app/[lang]/[mode]/[firstSegment]/_components/PortfolioPage';
import type { FullPageDocument } from '@features/PageBuilder';
import type { FeaturedProjectsSectionBlock } from '@features/featured-project-section/types';
import type { Project } from '@shared/types';

const service = vi.hoisted(() => ({
  getSetting: vi.fn(),
  getLatestProjects: vi.fn(),
}));
vi.mock('@services/contentService', () => ({ ContentService: service }));
vi.mock('@shared/components', async () => ({
  PortfolioGrid: (
    await import('@shared/components/common/portfolio-grid/PortfolioGrid')
  ).default,
  SectionShell: ({
    children,
    background,
  }: {
    children: ReactNode;
    background?: string;
  }) => <section data-background={background ?? 'none'}>{children}</section>,
  SectionHeader: ({
    heading,
  }: {
    heading: { eyebrow?: string; heading: string; body?: string };
  }) => (
    <header>
      {heading.eyebrow && <span>{heading.eyebrow}</span>}
      <h2>{heading.heading}</h2>
      {heading.body && <p>{heading.body}</p>}
    </header>
  ),
  CtaButton: ({ ctaButton }: { ctaButton: { label: string } }) => (
    <button>{ctaButton.label}</button>
  ),
  ModeGuard: ({
    mode,
    ProductionComponent,
    WeddingComponent,
    props,
  }: {
    mode: 'production' | 'wedding';
    ProductionComponent: (props: Record<string, unknown>) => ReactNode;
    WeddingComponent: (props: Record<string, unknown>) => ReactNode;
    props: Record<string, unknown>;
  }) =>
    mode === 'wedding' ? (
      <WeddingComponent {...props} />
    ) : (
      <ProductionComponent {...props} />
    ),
  ImageWithFrame: ({ alt }: { alt: string }) => (
    <div role='img' aria-label={alt} />
  ),
}));
vi.mock(
  '@features/featured-project-section/components/AnimatedWeddingImage',
  () => ({
    default: ({
      children,
      className,
      order,
    }: {
      children: ReactNode;
      className: string;
      order: number;
    }) => (
      <div
        data-testid='wedding-featured-image'
        data-order={order}
        className={className}
      >
        {children}
      </div>
    ),
  })
);
vi.mock(
  '@shared/components/common/portfolio-grid/AnimatedPortfolioGrid',
  () => ({
    default: ({
      children,
      className,
    }: {
      children: ReactNode;
      className: string;
    }) => (
      <section data-testid='animated-portfolio-grid' className={className}>
        {children}
      </section>
    ),
  })
);
vi.mock('@shared/components/common/portfolio-grid/ProjectCard', () => ({
  default: ({
    project,
    lang,
    mode,
    portfolioSlug,
  }: {
    project: Project;
    lang: string;
    mode: string;
    portfolioSlug: string;
  }) => (
    <a href={`/${lang}/${mode}/${portfolioSlug}/${project.slug}`}>
      {project.title}
    </a>
  ),
}));
vi.mock('@features/PageBuilder', () => ({
  default: () => (
    <div className='contents' data-testid='page-content'>
      <header>Page introduction</header>
    </div>
  ),
}));
vi.mock(
  '@/app/[lang]/[mode]/[firstSegment]/_components/PortfolioFilter',
  () => ({
    default: () => <nav aria-label='Project filters' />,
  })
);
vi.mock(
  '@/app/[lang]/[mode]/[firstSegment]/_components/NumberedPagination',
  () => ({
    default: () => <nav aria-label='Project pagination' />,
  })
);

const projects: Project[] = ['first', 'second'].map((id) => ({
  _id: id,
  title: `Project ${id}`,
  slug: id,
  siteMode: ['production', 'wedding'],
  projectDate: '2026-01-01',
}));

describe('Portfolio reveal consumers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getSetting.mockResolvedValue({
      productionPortfolioSlug: 'work',
      weddingPortfolioSlug: 'films',
    });
    service.getLatestProjects.mockResolvedValue(projects);
  });
  afterEach(cleanup);

  for (const mode of ['production', 'wedding'] as const) {
    const slug = mode === 'production' ? 'work' : 'films';

    if (mode === 'production') {
      it.each(['latest', 'curated'] as const)(
        `uses the shared reveal for ${mode} Featured Projects with %s`,
        async (sourceType) => {
          const block: FeaturedProjectsSectionBlock = {
            _type: 'featuredProjectsSection',
            heading: { heading: 'Featured work' },
            ctaButton: {
              label: 'View all',
              style: 'primary',
              linkType: 'internal',
            },
            ...(sourceType === 'latest'
              ? { sourceType }
              : { sourceType, selectedProjects: projects }),
          };
          render(await FeaturedProjectSection({ block, lang: 'en', mode }));
          const grid = screen.getByTestId('animated-portfolio-grid');
          expect(
            within(grid)
              .getAllByRole('link')
              .map((link) => link.getAttribute('href'))
          ).toEqual([
            `/en/${mode}/${slug}/first`,
            `/en/${mode}/${slug}/second`,
          ]);
          expect(grid).not.toContainElement(
            screen.getByRole('heading', { name: 'Featured work' })
          );
          expect(grid).not.toContainElement(
            screen.getByRole('button', { name: 'View all' })
          );
          expect(service.getSetting).toHaveBeenCalledWith({ lang: 'en' });
          if (sourceType === 'latest') {
            expect(service.getLatestProjects).toHaveBeenCalledWith({
              lang: 'en',
              mode,
            });
          } else {
            expect(service.getLatestProjects).not.toHaveBeenCalled();
          }
        }
      );
    }

    it(`keeps a page-level scroll target around the ${mode} introduction and project list`, () => {
      const { container } = render(
        <PortfolioPage
          page={{} as FullPageDocument}
          projects={projects}
          tags={[]}
          lang='th'
          mode={mode}
          currentPage={1}
          currentLimit={6}
          totalPages={2}
          portfolioSlug={slug}
        />
      );
      const pageRoot = screen.getByTestId('portfolio-page');
      expect(container.children).toHaveLength(1);
      expect(container.firstElementChild).toBe(pageRoot);
      expect(pageRoot).not.toHaveClass('contents');
      expect(pageRoot.firstElementChild).toBe(
        screen.getByTestId('page-content')
      );
      expect(pageRoot).toContainElement(
        screen.getByRole('navigation', { name: 'Project filters' })
      );
      expect(pageRoot).toContainElement(
        screen.getByRole('navigation', { name: 'Project pagination' })
      );
      const grid = screen.getByTestId('animated-portfolio-grid');
      expect(pageRoot).toContainElement(grid);
      expect(within(grid).getAllByRole('link')).toHaveLength(2);
      expect(within(grid).getAllByRole('link')[0]).toHaveAttribute(
        'href',
        `/th/${mode}/${slug}/first`
      );
      expect(grid).not.toContainElement(
        screen.getByRole('navigation', { name: 'Project filters' })
      );
      expect(grid).not.toContainElement(
        screen.getByRole('navigation', { name: 'Project pagination' })
      );
      expect(service.getSetting).not.toHaveBeenCalled();
      expect(service.getLatestProjects).not.toHaveBeenCalled();
    });
  }

  it('renders the Wedding collage in CMS order without the Production grid', async () => {
    const weddingProjects = [
      ...projects,
      {
        ...projects[0],
        _id: 'third',
        slug: 'third',
        title: 'Project third',
      },
    ];
    const block: FeaturedProjectsSectionBlock = {
      _type: 'featuredProjectsSection',
      sourceType: 'curated',
      selectedProjects: weddingProjects,
      heading: {
        eyebrow: 'Featured stories',
        heading: 'Love Stories',
        body: 'Captured with care',
      },
      ctaButton: {
        label: 'Discover more memories',
        style: 'primary',
        linkType: 'internal',
      },
    };

    render(
      await FeaturedProjectSection({ block, lang: 'en', mode: 'wedding' })
    );

    expect(screen.queryByTestId('animated-portfolio-grid')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Love Stories' })).toBeVisible();
    expect(screen.getByText('Featured stories')).toBeVisible();
    expect(screen.getByText('Captured with care')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Discover more memories' })
    ).toBeVisible();
    const images = screen.getAllByTestId('wedding-featured-image');
    expect(images.map((image) => image.getAttribute('data-order'))).toEqual([
      '0',
      '1',
      '2',
    ]);
    expect(images[2]).toHaveClass('hidden');
    expect(
      screen.getAllByRole('link').map((link) => link.getAttribute('href'))
    ).toEqual([
      '/en/wedding/films/first',
      '/en/wedding/films/second',
      '/en/wedding/films/third',
    ]);
    expect(service.getLatestProjects).not.toHaveBeenCalled();
  });

  it.each([
    { background: 'default', colorClass: 'bg-background-secondary' },
    { background: 'muted', colorClass: 'bg-secondary' },
    { background: 'contrast', colorClass: 'bg-primary' },
  ])(
    'keeps the $background Wedding background inside the bounded panel',
    async ({ background, colorClass }) => {
      const { container } = render(
        await FeaturedProjectSection({
          block: {
            _type: 'featuredProjectsSection',
            sourceType: 'curated',
            selectedProjects: projects,
            heading: { heading: 'Love Stories' },
            background,
          },
          lang: 'en',
          mode: 'wedding',
        })
      );

      expect(container.querySelector('section')).toHaveAttribute(
        'data-background',
        'none'
      );
      expect(screen.getByTestId('wedding-featured-panel')).toHaveClass(
        'lg:w-3/5',
        colorClass
      );
      expect(
        screen.getByTestId('wedding-featured-landscape-backdrop')
      ).toHaveClass('h-1/2', colorClass);
    }
  );

  it('keeps the Production background on SectionShell', async () => {
    const { container } = render(
      await FeaturedProjectSection({
        block: {
          _type: 'featuredProjectsSection',
          sourceType: 'latest',
          heading: { heading: 'Featured work' },
          background: 'muted',
        },
        lang: 'en',
        mode: 'production',
      })
    );

    expect(container.querySelector('section')).toHaveAttribute(
      'data-background',
      'muted'
    );
  });

  it.each([
    { fetchedProjects: null, expectedImages: 0 },
    { fetchedProjects: [projects[0]], expectedImages: 1 },
  ])(
    'keeps the Wedding heading and optional CTA with $expectedImages latest projects',
    async ({ fetchedProjects, expectedImages }) => {
      service.getLatestProjects.mockResolvedValue(fetchedProjects);

      render(
        await FeaturedProjectSection({
          block: {
            _type: 'featuredProjectsSection',
            sourceType: 'latest',
            heading: { heading: 'Love Stories' },
          },
          lang: 'en',
          mode: 'wedding',
        })
      );

      expect(
        screen.getByRole('heading', { name: 'Love Stories' })
      ).toBeVisible();
      expect(screen.queryAllByRole('link')).toHaveLength(expectedImages);
      expect(screen.queryByRole('button')).toBeNull();
      expect(service.getLatestProjects).toHaveBeenCalledWith({
        lang: 'en',
        mode: 'wedding',
      });
    }
  );

  it('preserves the empty latest-project fallback', async () => {
    service.getLatestProjects.mockResolvedValue(null);
    render(
      await FeaturedProjectSection({
        block: {
          _type: 'featuredProjectsSection',
          sourceType: 'latest',
          heading: { heading: 'Empty' },
        },
        lang: 'en',
        mode: 'production',
      })
    );
    expect(screen.getByTestId('animated-portfolio-grid').children).toHaveLength(
      0
    );
  });
});
