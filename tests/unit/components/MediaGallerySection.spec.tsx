import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MediaGallerySection from '@features/media-gallery-section/MediaGallerySection';
import type { MediaGallerySectionBlock } from '@features/media-gallery-section/types';
import type { Locale, SiteMode } from '@shared/config';
import type { MediaItem } from '@shared/types';

const mocks = vi.hoisted(() => ({ useDeviceTier: vi.fn() }));
vi.mock('@shared/hooks', () => ({ useDeviceTier: mocks.useDeviceTier }));
vi.mock('next/navigation', () => ({ useParams: () => ({ lang: 'en' }) }));
vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    alt = '',
    ...props
  }: ComponentProps<'img'> & { fill?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element -- No network image optimization in fixtures.
    <img {...props} alt={alt} />
  ),
}));
vi.mock('motion/react', () => ({
  m: {
    div: ({
      children,
      className,
      'data-testid': testId,
    }: {
      children: ReactNode;
      className?: string;
      'data-testid'?: string;
    }) => (
      <div className={className} data-testid={testId}>
        {children}
      </div>
    ),
    figure: ({
      children,
      className,
      'data-testid': testId,
    }: {
      children: ReactNode;
      className?: string;
      'data-testid'?: string;
    }) => (
      <figure className={className} data-testid={testId}>
        {children}
      </figure>
    ),
  },
}));
vi.mock('@shared/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/components')>()),
  VideoLoop: () => null,
}));
vi.mock('@features/media-gallery-section/components/VideoItem', () => ({
  default: ({ src }: { src: string }) => (
    <video data-testid='fixture-video' src={src} />
  ),
}));
vi.mock('@/sanity/lib/image', async () => {
  const { createImageUrlBuilder } = await import('@sanity/image-url');
  const builder = createImageUrlBuilder({
    projectId: 'fixture',
    dataset: 'production',
  });
  return { urlFor: builder.image.bind(builder) };
});

function media(id: string, alt: string): MediaItem {
  return {
    image: {
      asset: { _ref: `image-${id}-1200x1600-jpg`, _type: 'reference' },
      crop: { top: 0.1, bottom: 0.1, left: 0, right: 0 },
      hotspot: { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    },
    alt,
  };
}
const block: MediaGallerySectionBlock = {
  _type: 'mediaGallerySection',
  sectionVariant: 'collage',
  heading: {
    eyebrow: 'Featured stories',
    heading: 'Love Stories',
    body: 'Captured with care',
  },
  collageImages: {
    smallPortrait: media('small', 'Small portrait'),
    landscape: media('wide', 'Landscape'),
    largePortrait: media('large', 'Large portrait'),
  },
  items: [{ _key: 'grid', media: media('grid', 'Grid photo') }],
  cta: {
    label: 'Discover more memories',
    style: 'secondary',
    linkType: 'internal',
    pageRef: { slug: 'memories' },
  },
};

describe('MediaGallerySection presentations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useDeviceTier.mockReturnValue({
      isInitialized: true,
      allowHeavyMotion: true,
    });
  });
  afterEach(cleanup);

  it.each([
    { mode: 'production', variant: undefined },
    { mode: 'production', variant: 'grid' },
    { mode: 'production', variant: 'collage' },
    { mode: 'wedding', variant: undefined },
    { mode: 'wedding', variant: 'grid' },
  ] as const)(
    'preserves Grid for $mode with variant $variant',
    ({ mode, variant }) => {
      render(
        <MediaGallerySection
          block={{ ...block, sectionVariant: variant }}
          lang='en'
          mode={mode}
        />
      );
      expect(screen.getByTestId('gallery-item-image')).toBeVisible();
      expect(screen.getByAltText('Grid photo')).toBeVisible();
      expect(screen.queryByTestId('wedding-gallery-panel')).toBeNull();
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        `/en/${mode}/memories`
      );
    }
  );

  it.each(['en', 'th'] as const)(
    'renders named image slots without photo links in %s',
    (lang) => {
      render(<MediaGallerySection block={block} lang={lang} mode='wedding' />);
      const images = screen.getAllByRole('img');
      expect(images.map((image) => image.getAttribute('alt'))).toEqual([
        'Small portrait',
        'Landscape',
        'Large portrait',
      ]);
      const expected = [
        { width: '382', height: '550', ratio: '191 / 275' },
        { width: '1046', height: '612', ratio: '523 / 306' },
        { width: '940', height: '1096', ratio: '470 / 548' },
      ];
      images.forEach((image, index) => {
        expect(image.closest('a')).toBeNull();
        expect(image.parentElement).toHaveStyle({
          aspectRatio: expected[index].ratio,
        });
        const url = new URL(image.getAttribute('src')!);
        expect(url.searchParams.get('w')).toBe(expected[index].width);
        expect(url.searchParams.get('h')).toBe(expected[index].height);
        expect(url.searchParams.get('fit')).toBe('crop');
        expect(url.searchParams.get('q')).toBe('85');
        expect(url.searchParams.has('rect')).toBe(true);
      });
      expect(
        screen.getByRole('heading', { name: 'Love Stories' })
      ).toBeVisible();
      expect(screen.getByText('Featured stories')).toBeVisible();
      expect(screen.getByText('Captured with care')).toBeVisible();
      expect(screen.getAllByRole('link')).toHaveLength(1);
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        `/${lang}/wedding/memories`
      );
      expect(screen.getByRole('button')).toHaveAttribute(
        'data-variant',
        'secondary'
      );
      expect(screen.getAllByTestId('wedding-gallery-image')[2]).toHaveClass(
        'hidden',
        'lg:block'
      );
    }
  );

  it.each([
    { background: 'default', colorClass: 'bg-background-secondary' },
    { background: 'muted', colorClass: 'bg-secondary' },
    { background: 'contrast', colorClass: 'bg-primary' },
  ])(
    'bounds the $background panel and stops the backdrop halfway down the lower frame',
    ({ background, colorClass }) => {
      const { container } = render(
        <MediaGallerySection
          block={{ ...block, background }}
          lang='en'
          mode='wedding'
        />
      );
      const shell = container.querySelector('section')!;
      expect(shell).toHaveAttribute('data-sanity-type', 'mediaGallerySection');
      expect(shell).not.toHaveClass('bg-secondary', 'bg-primary');
      expect(shell.firstElementChild).toHaveClass('max-w-7xl', 'mx-auto');
      expect(screen.getByTestId('wedding-gallery-panel')).toHaveClass(
        'w-full',
        'lg:w-3/5',
        'lg:ml-auto',
        colorClass
      );
      expect(
        screen.getByTestId('wedding-gallery-landscape-backdrop')
      ).toHaveClass('h-1/2', colorClass);
    }
  );

  it.each(['en', 'th'] as const)(
    'keeps missing slots in place with a localized placeholder in %s',
    (lang: Locale) => {
      render(
        <MediaGallerySection
          block={{
            ...block,
            collageImages: { landscape: block.collageImages!.landscape },
            cta: undefined,
            heading: { heading: 'Love Stories' },
          }}
          lang={lang}
          mode='wedding'
        />
      );
      expect(screen.getAllByTestId('wedding-gallery-image')).toHaveLength(3);
      expect(
        screen.getAllByText(lang === 'th' ? 'ไม่มีรูปภาพ' : 'No Image')
      ).toHaveLength(2);
      expect(screen.getByAltText('Landscape')).toBeVisible();
      expect(screen.queryByAltText('Grid photo')).toBeNull();
      expect(screen.queryByRole('link')).toBeNull();
      expect(screen.queryByText('Featured stories')).toBeNull();
      expect(screen.queryByText('Captured with care')).toBeNull();
    }
  );

  it('keeps all three frames when collage data is absent without using Grid items', () => {
    render(
      <MediaGallerySection
        block={{ ...block, collageImages: undefined, cta: undefined }}
        lang='en'
        mode='wedding'
      />
    );
    expect(screen.getAllByText('No Image')).toHaveLength(3);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getAllByTestId('wedding-gallery-image')).toHaveLength(3);
  });

  it('uses CMS external CTA settings rather than a fixed portfolio destination', () => {
    render(
      <MediaGallerySection
        block={{
          ...block,
          cta: {
            label: 'See our films',
            style: 'link',
            linkType: 'external',
            externalUrl: 'https://example.com/films',
          },
        }}
        lang='th'
        mode='wedding'
      />
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com/films'
    );
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link')).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'link');
  });

  it('renders a complete static collage when heavy motion is not allowed', () => {
    mocks.useDeviceTier.mockReturnValue({
      isInitialized: true,
      allowHeavyMotion: false,
    });
    render(<MediaGallerySection block={block} lang='en' mode='wedding' />);
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.queryByTestId('wedding-gallery-image')).toBeNull();
    expect(
      screen.getByAltText('Large portrait').closest('section')!.parentElement
    ).toHaveClass('hidden', 'lg:block');
  });

  it('retains image instances for text changes and replays after an image edit', () => {
    const { rerender } = render(
      <MediaGallerySection block={block} lang='en' mode='wedding' />
    );
    const first = screen.getByAltText('Small portrait');
    rerender(
      <MediaGallerySection
        block={{ ...block, heading: { heading: 'New heading' } }}
        lang='en'
        mode='wedding'
      />
    );
    expect(screen.getByAltText('Small portrait')).toBe(first);
    rerender(
      <MediaGallerySection
        block={{
          ...block,
          collageImages: {
            ...block.collageImages,
            smallPortrait: media('replacement', 'Replacement'),
          },
        }}
        lang='en'
        mode='wedding'
      />
    );
    expect(screen.getByAltText('Replacement')).not.toBe(first);
    expect(screen.getByAltText('Replacement').getAttribute('src')).toContain(
      'replacement'
    );
  });

  it.each(['production', 'wedding'] as const)(
    'preserves mixed media and legacy project links in the %s Grid',
    (mode: SiteMode) => {
      render(
        <MediaGallerySection
          block={{
            ...block,
            sectionVariant: 'grid',
            cta: undefined,
            items: [
              {
                _key: 'video',
                mediaType: 'video',
                videoUrl: 'https://example.com/fixture.mp4',
                label: 'Video',
              },
              {
                _key: 'project',
                media: media('project', 'Project photo'),
                projectSlug: 'legacy',
                projectOverview: 'Overview',
              },
              { _key: 'missing' },
            ],
          }}
          lang='th'
          mode={mode}
        />
      );
      expect(screen.getByTestId('fixture-video')).toHaveAttribute(
        'src',
        'https://example.com/fixture.mp4'
      );
      expect(screen.getByTestId('gallery-item-project')).toBeVisible();
      expect(screen.getByText('Overview')).toBeVisible();
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/th/work/legacy'
      );
      expect(screen.getAllByRole('figure')).toHaveLength(2);
    }
  );
});
