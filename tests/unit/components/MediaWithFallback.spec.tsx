import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { createRef, StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MediaWithFallback from '@shared/components/common/MediaWithFallback';
import ImageWithFrame from '@shared/components/common/ImageWithFrame';

vi.mock('next/image', async () => import('../../support/media/FixtureImage'));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function status(container: HTMLElement) {
  return container.querySelector('[data-slot="media-with-fallback"]');
}

describe('MediaWithFallback images', () => {
  it.each([
    ['en', 'No Image', 'Unable to load image', 'Loading image…'],
    ['th', 'ไม่มีรูปภาพ', 'ไม่สามารถโหลดรูปภาพได้', 'กำลังโหลดรูปภาพ…'],
  ] as const)(
    'separates every image state in %s',
    (lang, missing, error, loading) => {
      const { container, rerender } = render(
        <MediaWithFallback
          mediaType='image'
          source={undefined}
          lang={lang}
          alt='Cover'
          fill
        />
      );
      expect(status(container)).toHaveAttribute(
        'data-media-status',
        'source-missing'
      );
      expect(screen.getByRole('status')).toHaveTextContent(missing);
      expect(screen.queryByRole('img')).toBeNull();
      rerender(
        <MediaWithFallback
          mediaType='image'
          source='/cover.jpg'
          lang={lang}
          alt='Cover'
          fill
        />
      );
      expect(status(container)).toHaveAttribute('data-media-status', 'loading');
      expect(screen.getByText(loading)).toHaveClass(
        'sr-only',
        'motion-reduce:not-sr-only'
      );
      expect(
        container.querySelector('[data-slot="media-loading-surface"]')
      ).toHaveClass('motion-safe:animate-pulse');
      const image = screen.getByRole('img', { name: 'Cover' });
      expect(image).toHaveAttribute('aria-busy', 'true');
      fireEvent.load(image);
      expect(status(container)).toHaveAttribute('data-media-status', 'success');
      expect(screen.queryByRole('status')).toBeNull();
      expect(image).toHaveAttribute('aria-busy', 'false');
      rerender(
        <MediaWithFallback
          mediaType='image'
          source='/broken.jpg'
          lang={lang}
          alt='Cover'
          fill
        />
      );
      expect(status(container)).toHaveAttribute('data-media-status', 'loading');
      fireEvent.error(screen.getByRole('img'));
      expect(status(container)).toHaveAttribute('data-media-status', 'error');
      expect(screen.getByRole('status')).toHaveTextContent(error);
      expect(
        container.querySelector('.motion-safe\\:animate-pulse')
      ).toBeNull();
      rerender(
        <MediaWithFallback
          mediaType='image'
          source='/recovered.jpg'
          lang={lang}
          alt='Cover'
          fill
        />
      );
      fireEvent.load(screen.getByRole('img'));
      expect(status(container)).toHaveAttribute('data-media-status', 'success');
    }
  );

  it.each([undefined, null, '', '   '])(
    'does not request an empty source: %j',
    (source) => {
      const { container } = render(
        <MediaWithFallback
          mediaType='image'
          source={source}
          lang='en'
          alt=''
          fill
        />
      );
      expect(status(container)).toHaveAttribute(
        'data-media-status',
        'source-missing'
      );
      expect(container.querySelector('img')).toBeNull();
    }
  );

  it('renders an upstream source-resolution failure as error rather than missing', () => {
    const { container } = render(
      <MediaWithFallback
        mediaType='image'
        source={{ error: true }}
        lang='en'
        alt=''
        fill
      />
    );
    expect(status(container)).toHaveAttribute('data-media-status', 'error');
    expect(screen.getByText('Unable to load image')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('preserves image props, consumer callbacks, refs, and callback-ref cleanup', () => {
    const onLoad = vi.fn(),
      onError = vi.fn(),
      release = vi.fn();
    const ref = vi.fn(() => release);
    const { container, rerender } = render(
      <MediaWithFallback
        mediaType='image'
        source='/a.jpg'
        lang='en'
        alt='Alt'
        width={320}
        height={180}
        sizes='50vw'
        loading='eager'
        priority
        ref={ref}
        onLoad={onLoad}
        onError={onError}
        className='object-contain'
      />
    );
    const image = screen.getByAltText('Alt');
    expect(image).toHaveAttribute('width', '320');
    expect(image).toHaveAttribute('height', '180');
    expect(image).toHaveAttribute('sizes', '50vw');
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveClass('object-contain');
    expect(ref).toHaveBeenCalledWith(image);
    expect(status(container)).toHaveStyle({ aspectRatio: '320/180' });
    fireEvent.load(image);
    expect(onLoad).toHaveBeenCalledOnce();
    fireEvent.error(image);
    expect(onError).toHaveBeenCalledOnce();
    expect(release).toHaveBeenCalledOnce();
    rerender(
      <MediaWithFallback
        mediaType='image'
        source='/b.jpg'
        lang='en'
        alt='Alt'
        width={320}
        height={180}
      />
    );
    expect(status(container)).toHaveAttribute('data-media-status', 'loading');
  });

  it.each([0, 640])(
    'settles already-complete cached images with naturalWidth=%i',
    (naturalWidth) => {
      vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(
        true
      );
      vi.spyOn(
        HTMLImageElement.prototype,
        'naturalWidth',
        'get'
      ).mockReturnValue(naturalWidth);
      const { container } = render(
        <MediaWithFallback
          mediaType='image'
          source='/cached.jpg'
          lang='en'
          alt='Cached'
          fill
        />
      );
      expect(status(container)).toHaveAttribute(
        'data-media-status',
        naturalWidth ? 'success' : 'error'
      );
    }
  );

  it('supports static imports and resets only when the image source changes', () => {
    const source = { src: '/static.png', width: 400, height: 250 };
    const { container, rerender } = render(
      <MediaWithFallback
        mediaType='image'
        source={{ default: source }}
        lang='en'
        alt='Static'
      />
    );
    const image = screen.getByAltText('Static');
    fireEvent.load(image);
    expect(status(container)).toHaveStyle({ aspectRatio: '400/250' });
    rerender(
      <MediaWithFallback
        mediaType='image'
        source={source}
        lang='th'
        alt='Static'
      />
    );
    expect(screen.getByAltText('Static')).toBe(image);
    expect(status(container)).toHaveAttribute('data-media-status', 'success');
  });

  it('cleans up object refs on unmount', () => {
    const ref = createRef<HTMLImageElement>();
    const { unmount } = render(
      <MediaWithFallback
        mediaType='image'
        source='/ref.jpg'
        lang='en'
        alt=''
        fill
        ref={ref}
      />
    );
    expect(ref.current).toBeInstanceOf(HTMLImageElement);
    unmount();
    expect(ref.current).toBeNull();
  });
});

describe('MediaWithFallback native videos', () => {
  it('recovers a source failure missed before ref attachment without replaying an event', () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLMediaElement.prototype, 'networkState', 'get').mockReturnValue(
      HTMLMediaElement.NETWORK_NO_SOURCE
    );
    vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(
      HTMLMediaElement.HAVE_NOTHING
    );
    const onError = vi.fn();
    const { container } = render(
      <MediaWithFallback
        mediaType='video'
        source='/failed.mp4'
        lang='en'
        onError={onError}
        ref={(video) => {
          if (video) Object.defineProperty(video, 'error', { value: null });
        }}
      />
    );
    expect(status(container)).toHaveAttribute('data-media-status', 'loading');
    act(() => vi.runOnlyPendingTimers());
    expect(status(container)).toHaveAttribute('data-media-status', 'error');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Unable to load video'
    );
    expect(onError).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['loading', 'ready'] as const)(
    'does not mistake transient NETWORK_NO_SOURCE for failure when selection becomes %s',
    (next) => {
      vi.useFakeTimers();
      const network = vi
        .spyOn(HTMLMediaElement.prototype, 'networkState', 'get')
        .mockReturnValue(HTMLMediaElement.NETWORK_NO_SOURCE);
      const ready = vi
        .spyOn(HTMLMediaElement.prototype, 'readyState', 'get')
        .mockReturnValue(HTMLMediaElement.HAVE_NOTHING);
      const { container } = render(
        <MediaWithFallback mediaType='video' source='/healthy.mp4' lang='en' />
      );
      expect(status(container)).toHaveAttribute('data-media-status', 'loading');
      network.mockReturnValue(HTMLMediaElement.NETWORK_LOADING);
      if (next === 'ready') {
        ready.mockReturnValue(HTMLMediaElement.HAVE_FUTURE_DATA);
        fireEvent.canPlay(container.querySelector('video')!);
      }
      act(() => vi.runOnlyPendingTimers());
      expect(status(container)).toHaveAttribute(
        'data-media-status',
        next === 'ready' ? 'success' : 'loading'
      );
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it('observes a video error appearing during the deferred selection task', () => {
    vi.useFakeTimers();
    const { container } = render(
      <MediaWithFallback mediaType='video' source='/film.mp4' lang='en' />
    );
    const error: MediaError = {
      code: 4,
      message: 'Unsupported source',
      MEDIA_ERR_ABORTED: 1,
      MEDIA_ERR_NETWORK: 2,
      MEDIA_ERR_DECODE: 3,
      MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
    };
    Object.defineProperty(container.querySelector('video')!, 'error', {
      value: error,
    });
    act(() => vi.runOnlyPendingTimers());
    expect(status(container)).toHaveAttribute('data-media-status', 'error');
  });

  it.each([false, true])(
    'clears selection checks and callback refs under StrictMode=%s',
    (strict) => {
      vi.useFakeTimers();
      const release = vi.fn();
      const ref = vi.fn(() => release);
      const element = (
        <MediaWithFallback
          mediaType='video'
          source='/film.mp4'
          lang='en'
          ref={ref}
        />
      );
      const { unmount } = render(
        strict ? <StrictMode>{element}</StrictMode> : element
      );
      expect(vi.getTimerCount()).toBe(1);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
      expect(release).toHaveBeenCalledTimes(ref.mock.calls.length);
    }
  );

  it('cancels stale checks on source/ref changes and releases object refs', () => {
    vi.useFakeTimers();
    const first = createRef<HTMLVideoElement>();
    const second = createRef<HTMLVideoElement>();
    const { container, rerender, unmount } = render(
      <MediaWithFallback
        mediaType='video'
        source='/a.mp4'
        lang='en'
        ref={first}
      />
    );
    const oldVideo = first.current!;
    const readOldNetwork = vi.spyOn(oldVideo, 'networkState', 'get');
    rerender(
      <MediaWithFallback
        mediaType='video'
        source='/b.mp4'
        lang='en'
        ref={first}
      />
    );
    expect(first.current).not.toBe(oldVideo);
    expect(vi.getTimerCount()).toBe(1);
    const currentVideo = first.current;
    rerender(
      <MediaWithFallback
        mediaType='video'
        source='/b.mp4'
        lang='en'
        ref={second}
      />
    );
    expect(first.current).toBeNull();
    expect(second.current).toBe(currentVideo);
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.runOnlyPendingTimers());
    expect(readOldNetwork).not.toHaveBeenCalled();
    expect(status(container)).toHaveAttribute('data-media-status', 'loading');
    unmount();
    expect(second.current).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['./film.mp4', 'videos/film.mp4'])(
    'lets the browser resolve a relative video source: %s',
    (source) => {
      const { container } = render(
        <MediaWithFallback mediaType='video' source={source} lang='en' />
      );
      expect(container.querySelector('source')).toHaveAttribute('src', source);
      expect(status(container)).toHaveAttribute('data-media-status', 'loading');
      fireEvent.canPlay(container.querySelector('video')!);
      expect(status(container)).toHaveAttribute('data-media-status', 'success');
    }
  );

  it.each([
    ['en', 'No Video', 'Unable to load video', 'Loading video…'],
    ['th', 'ไม่มีวิดีโอ', 'ไม่สามารถโหลดวิดีโอได้', 'กำลังโหลดวิดีโอ…'],
  ] as const)(
    'separates video states and preserves playback props in %s',
    (lang, missing, error, loading) => {
      const onCanPlay = vi.fn(),
        onError = vi.fn();
      const ref = createRef<HTMLVideoElement>();
      const { container, rerender } = render(
        <MediaWithFallback mediaType='video' source={null} lang={lang} />
      );
      expect(screen.getByText(missing)).toBeInTheDocument();
      rerender(
        <MediaWithFallback
          mediaType='video'
          source='/film.mp4'
          lang={lang}
          ref={ref}
          mimeType='video/mp4'
          autoPlay
          muted
          loop
          playsInline
          preload='metadata'
          onCanPlay={onCanPlay}
          onError={onError}
        />
      );
      const video = container.querySelector('video')!;
      expect(screen.getByText(loading)).toHaveClass('sr-only');
      expect(ref.current).toBe(video);
      expect(video).toHaveAttribute('autoplay');
      expect(video).toHaveAttribute('loop');
      expect(video).toHaveAttribute('playsinline');
      expect(video).toHaveAttribute('preload', 'metadata');
      expect(video.muted).toBe(true);
      expect(video.querySelector('source')).toHaveAttribute(
        'type',
        'video/mp4'
      );
      fireEvent.loadedMetadata(video);
      expect(status(container)).toHaveAttribute('data-media-status', 'loading');
      fireEvent.canPlay(video);
      expect(onCanPlay).toHaveBeenCalledOnce();
      expect(status(container)).toHaveAttribute('data-media-status', 'success');
      for (const event of ['pause', 'waiting', 'stalled', 'play'])
        fireEvent(video, new Event(event));
      expect(status(container)).toHaveAttribute('data-media-status', 'success');
      fireEvent.error(video);
      expect(onError).toHaveBeenCalledOnce();
      expect(status(container)).toHaveAttribute('data-media-status', 'error');
      expect(screen.getByText(error)).toBeInTheDocument();
      expect(ref.current).toBe(video);
    }
  );

  it('handles a sole source error and resets for a new source', () => {
    const { container, rerender } = render(
      <MediaWithFallback mediaType='video' source='/bad.webm' lang='en' />
    );
    fireEvent.error(container.querySelector('source')!);
    expect(status(container)).toHaveAttribute('data-media-status', 'error');
    rerender(
      <MediaWithFallback mediaType='video' source='/good.webm' lang='en' />
    );
    expect(status(container)).toHaveAttribute('data-media-status', 'loading');
    fireEvent.canPlay(container.querySelector('video')!);
    expect(status(container)).toHaveAttribute('data-media-status', 'success');
  });

  it('keeps poster errors separate from playable video state', () => {
    const { container } = render(
      <MediaWithFallback
        mediaType='video'
        source='/film.mp4'
        poster='/poster.jpg'
        posterAlt='Poster'
        lang='en'
      />
    );
    fireEvent.error(screen.getByAltText('Poster'));
    expect(container.querySelector('video')).toHaveAttribute(
      'poster',
      '/poster.jpg'
    );
    expect(status(container)).toHaveAttribute('data-media-status', 'loading');
    fireEvent.canPlay(container.querySelector('video')!);
    expect(status(container)).toHaveAttribute('data-media-status', 'success');
    expect(screen.queryByText('Unable to load image')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('recognizes a ready video and cleans up callback refs without owning playback policy', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(
      3
    );
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play');
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause');
    const release = vi.fn();
    const ref = vi.fn(() => release);
    const { container, unmount } = render(
      <MediaWithFallback
        mediaType='video'
        source='/cached.mp4'
        lang='en'
        ref={ref}
        autoPlay={false}
      />
    );
    expect(status(container)).toHaveAttribute('data-media-status', 'success');
    expect(play).not.toHaveBeenCalled();
    expect(pause).not.toHaveBeenCalled();
    unmount();
    expect(release).toHaveBeenCalledOnce();
  });
});

describe('ImageWithFrame compatibility', () => {
  it('defaults locale to English and reserves the old frame geometry', () => {
    const { container } = render(<ImageWithFrame alt='Frame' />);
    expect(screen.getByText('No Image')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(
      'aspect-600/433',
      'max-h-[433px]',
      'max-w-[600px]'
    );
  });

  it('uses centralized localized messages while retaining its frame', () => {
    const { container, rerender } = render(
      <ImageWithFrame alt='Frame' lang='th' imageAspectRatio='191/275' />
    );
    expect(screen.getByRole('status')).toHaveTextContent('ไม่มีรูปภาพ');
    expect(container.querySelector('[style]')).toHaveStyle({
      aspectRatio: '191/275',
    });
    rerender(
      <ImageWithFrame
        src='/bad.jpg'
        alt='Frame'
        lang='th'
        imageAspectRatio='191/275'
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('กำลังโหลดรูปภาพ…');
    fireEvent.error(screen.getByAltText('Frame'));
    expect(screen.getByText('ไม่สามารถโหลดรูปภาพได้')).toBeInTheDocument();
  });
});
