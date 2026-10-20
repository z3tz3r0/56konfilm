import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '@shared/providers/MotionProvider';
import TwoColumnSection from '@features/two-column-section/TwoColumnSection';
import ProjectHero from '@shared/components/layout/project-detail/ProjectHero';
import PortableTextRenderer from '@shared/components/common/PortableTextRenderer';
import VideoShowreelSection from '@features/video-showreel-section/components/VideoShowreelSection';
import BlogPreviewSection from '@features/blog-preview-section/components/BlogPreviewSection';
import type { ImageSource } from '@shared/types/sanity';

const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('@/sanity/lib/client', () => ({ client: { fetch: mocks.fetch } }));
vi.mock('@shared/config/env', () => ({
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: 'fixture',
    NEXT_PUBLIC_SANITY_DATASET: 'development',
  },
}));
vi.mock('next/image', async () => import('../../support/media/FixtureImage'));
vi.mock('next/link', async () => import('../../support/media/FixtureLink'));
vi.mock('@shared/hooks', async () => import('@shared/hooks/useDeviceTier'));

function image(id = 'cover'): ImageSource {
  return {
    asset: { _ref: `image-${id}-1200x800-jpg` },
    crop: null,
    hotspot: null,
  };
}

beforeEach(() => {
  mocks.fetch.mockReset();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

for (const mode of ['production', 'wedding'] as const) {
  for (const lang of ['en', 'th'] as const) {
    describe(`content media ${mode}/${lang}`, () => {
      const missing = lang === 'th' ? 'ไม่มีรูปภาพ' : 'No Image';
      const error =
        lang === 'th' ? 'ไม่สามารถโหลดรูปภาพได้' : 'Unable to load image';

      it('retains the Two Column media slot, content, CTA, and original image options', () => {
        const block = {
          _type: 'twoColumnSection' as const,
          sectionVariant: 'standard' as const,
          content: { heading: 'Editorial heading', body: 'Editorial body' },
          ctas: [
            {
              label: 'Discover',
              style: 'secondary' as const,
              linkType: 'external' as const,
              externalUrl: 'https://example.test/discover',
            },
          ],
        };
        const { rerender } = render(
          <TwoColumnSection block={block} lang={lang} mode={mode} />
        );
        expect(screen.getByRole('status')).toHaveTextContent(missing);
        expect(screen.getByText('Editorial body')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute(
          'href',
          'https://example.test/discover'
        );
        rerender(
          <TwoColumnSection
            block={{
              ...block,
              media: { image: image(), alt: 'Editorial photo' },
            }}
            lang={lang}
            mode={mode}
          />
        );
        const photo = screen.getByAltText('Editorial photo');
        const url = new URL(photo.getAttribute('src')!);
        expect(url.searchParams.get('q')).toBe('80');
        expect(url.searchParams.get('fit')).toBe('clip');
        fireEvent.error(photo);
        expect(screen.getByRole('status')).toHaveTextContent(error);
        expect(screen.getByRole('heading')).toHaveTextContent(
          'Editorial heading'
        );
      });

      it('uses the central Project Hero fallback without losing its priority image frame', () => {
        const { container, rerender } = render(
          <ProjectHero
            lang={lang}
            projectTitle='Project title'
            coverImage={undefined}
          />
        );
        const frame = container.firstElementChild;
        expect(screen.getByRole('status')).toHaveTextContent(missing);
        rerender(
          <ProjectHero
            lang={lang}
            projectTitle='Project title'
            coverImage={image()}
          />
        );
        expect(container.firstElementChild).toBe(frame);
        const photo = screen.getByAltText('Project title');
        const url = new URL(photo.getAttribute('src')!);
        expect(url.searchParams.get('w')).toBe('1200');
        expect(url.searchParams.get('fit')).toBe('max');
        fireEvent.load(photo);
        expect(screen.queryByRole('status')).toBeNull();
        rerender(
          <ProjectHero
            lang={lang}
            projectTitle='Project title'
            coverImage={image('unavailable')}
          />
        );
        fireEvent.error(screen.getByAltText('Project title'));
        expect(screen.getByRole('status')).toHaveTextContent(error);
      });

      it('renders raw Portable Text image nodes with localized missing states and auto=format', () => {
        const raw = { _type: 'image', _key: 'photo', alt: 'Embedded photo' };
        const { rerender } = render(
          <PortableTextRenderer value={[raw]} lang={lang} />
        );
        expect(screen.getByRole('status')).toHaveTextContent(missing);
        const loadedValue = [
          { ...raw, asset: { _ref: 'image-cover-1200x800-jpg' } },
        ];
        rerender(<PortableTextRenderer value={loadedValue} lang={lang} />);
        const photo = screen.getByAltText('Embedded photo');
        const url = new URL(photo.getAttribute('src')!);
        expect(url.searchParams.get('auto')).toBe('format');
        expect(url.searchParams.get('w')).toBe('1200');
        expect(url.searchParams.get('fit')).toBe('max');
        fireEvent.error(photo);
        expect(screen.getByRole('status')).toHaveTextContent(error);
        const invalidValue = [{ ...raw, asset: { _ref: 'invalid-reference' } }];
        rerender(<PortableTextRenderer value={invalidValue} lang={lang} />);
        expect(screen.getByRole('status')).toHaveTextContent(error);
        expect(screen.queryByRole('img')).toBeNull();
      });

      it('preserves Showreel click-to-play and caption when its thumbnail is absent or broken', () => {
        const block = {
          _type: 'videoShowreelSection' as const,
          videoUrl: 'https://youtu.be/fixture',
          caption: 'Editorial caption',
        };
        const { container, rerender } = render(
          <VideoShowreelSection block={block} lang={lang} />
        );
        expect(screen.getByRole('status')).toHaveTextContent(missing);
        expect(screen.getByText('Editorial caption')).toBeInTheDocument();
        expect(container.querySelector('iframe')).toBeNull();
        rerender(
          <VideoShowreelSection
            block={{ ...block, thumbnail: image() }}
            lang={lang}
          />
        );
        const photo = screen.getByAltText('Editorial caption');
        const url = new URL(photo.getAttribute('src')!);
        expect(url.searchParams.get('w')).toBe('1280');
        expect(url.searchParams.get('h')).toBe('720');
        expect(url.searchParams.get('fit')).toBe('crop');
        fireEvent.error(photo);
        expect(screen.getByRole('status')).toHaveTextContent(error);
        fireEvent.click(screen.getByTestId('showreel-play'));
        expect(container.querySelector('iframe')).toHaveAttribute(
          'src',
          'https://www.youtube-nocookie.com/embed/fixture?autoplay=1&rel=0'
        );
        expect(screen.queryByRole('status')).toBeNull();
      });

      it('retains every fetched post thumbnail, link, and order without changing fetch/cache options', async () => {
        mocks.fetch.mockResolvedValue([
          { _id: 'first', title: 'First post', slug: 'first', image: image() },
          { _id: 'second', title: 'Second post', slug: 'second' },
          {
            _id: 'third',
            title: 'Third post',
            slug: 'third',
            image: image('broken'),
          },
        ]);
        const tree = await BlogPreviewSection({
          block: { _type: 'blogPreviewSection' },
          lang,
          mode,
        });
        render(<MotionProvider>{tree}</MotionProvider>);
        expect(screen.getAllByTestId('blog-post-card')).toHaveLength(3);
        expect(
          screen.getAllByRole('heading').map((node) => node.textContent)
        ).toEqual(['First post', 'Second post', 'Third post']);
        expect(
          within(screen.getAllByTestId('blog-post-card')[1]).getByRole('status')
        ).toHaveTextContent(missing);
        expect(
          screen.getAllByRole('link').map((node) => node.getAttribute('href'))
        ).toEqual([
          '/blog/first',
          '/blog/first',
          '/blog/second',
          '/blog/second',
          '/blog/third',
          '/blog/third',
        ]);
        fireEvent.error(screen.getByAltText('Third post'));
        expect(
          screen.getAllByRole('status').map((node) => node.textContent)
        ).toContain(error);
        expect(mocks.fetch).toHaveBeenCalledWith(
          expect.any(String),
          { limit: 2, lang },
          {
            cache: 'force-cache',
            next: { revalidate: false, tags: ['post'] },
          }
        );
      });
    });
  }
}

it('does not fabricate Blog posts or Portable Text nodes when no content exists', async () => {
  mocks.fetch.mockResolvedValue([]);
  expect(
    await BlogPreviewSection({
      block: { _type: 'blogPreviewSection' },
      lang: 'th',
      mode: 'wedding',
    })
  ).toBeNull();
  const { container } = render(<PortableTextRenderer value={[]} lang='th' />);
  expect(container).toBeEmptyDOMElement();
});
