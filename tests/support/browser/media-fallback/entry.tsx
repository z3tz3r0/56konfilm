import type { ReactNode } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server.browser';
import MediaWithFallback from '@shared/components/common/MediaWithFallback';
import ImageWithFrame from '@shared/components/common/ImageWithFrame';
import type { FixtureOptions } from './types';
import MediaCardFixture from './MediaCardFixture';
import ContentMediaFixture from './ContentMediaFixture';
import BlogPreviewSection from '@features/blog-preview-section/components/BlogPreviewSection';
import { MotionProvider } from '@shared/providers/MotionProvider';
import { setPosts } from './fixtureClient';
import { fixtureImage } from './mediaFixtures';
import { setVideoAutoplay } from './fixtureTier';

const container = document.getElementById('root')!;
let root: Root | undefined;
let serverElement: ReactNode;
window.mediaHydrationErrors = [];
window.mediaSourceErrors = 0;

/** Use actual server markup and hydrate it only after the browser has loaded media. */
function renderFixture(element: ReactNode, serverRendered = false) {
  if (serverRendered) {
    root?.unmount();
    root = undefined;
    serverElement = element;
    window.mediaSourceErrors = 0;
    container.innerHTML = renderToString(element);
    container.querySelector('source')?.addEventListener('error', () => {
      window.mediaSourceErrors++;
    });
  } else {
    root ??= createRoot(container);
    root.render(element);
  }
}

window.hydrateMediaFixture = () => {
  if (root || !serverElement)
    throw new Error('Expected unhydrated server markup.');
  root = hydrateRoot(container, serverElement, {
    onRecoverableError: (error) =>
      window.mediaHydrationErrors.push(String(error)),
  });
};

window.showMediaFixture = async ({
  mode = 'production',
  lang = 'en',
  mediaType = 'image',
  state = 'source-missing',
  frame = false,
  consumer,
  videoAutoplay = true,
  poster,
  preload = 'auto',
  serverRendered = false,
  sourceVersion,
}: FixtureOptions) => {
  document.documentElement.dataset.mode = mode;
  document.documentElement.lang = lang;
  setVideoAutoplay(videoAutoplay);
  if (consumer === 'blog') {
    setPosts([
      {
        _id: 'post',
        title: 'Fixture post',
        slug: 'fixture',
        image: fixtureImage(state),
      },
    ]);
    const content = await BlogPreviewSection({
      block: { _type: 'blogPreviewSection' },
      lang,
      mode,
    });
    renderFixture(
      <main className='bg-background p-4'>
        <MotionProvider>{content}</MotionProvider>
      </main>
    );
    return;
  }
  const source =
    state === 'source-missing'
      ? undefined
      : state === 'invalid'
        ? ({ error: true } as const)
        : `https://media.fixture.test/${state}.${mediaType === 'image' ? 'svg' : 'webm'}${sourceVersion === undefined ? '' : `?v=${sourceVersion}`}`;
  renderFixture(
    <main className='bg-background p-4'>
      {consumer === 'project' || consumer === 'team' ? (
        <MediaCardFixture
          consumer={consumer}
          mode={mode}
          lang={lang}
          state={state}
        />
      ) : consumer ? (
        <ContentMediaFixture
          consumer={consumer}
          mode={mode}
          lang={lang}
          state={state}
        />
      ) : frame ? (
        <ImageWithFrame
          src={source}
          lang={lang}
          alt='Framed cover'
          imageAspectRatio='191/275'
          className='mx-auto max-w-[360px]'
        />
      ) : (
        <div
          className='relative mx-auto aspect-video w-full max-w-[480px]'
          data-testid='media-frame'
        >
          {mediaType === 'image' ? (
            <MediaWithFallback
              mediaType='image'
              source={source}
              lang={lang}
              alt='Fixture cover'
              fill
              sizes='100vw'
              className='object-cover'
            />
          ) : (
            <MediaWithFallback
              mediaType='video'
              source={source}
              lang={lang}
              poster={
                poster
                  ? `https://media.fixture.test/poster-${poster}.svg`
                  : undefined
              }
              posterAlt='Fixture poster'
              autoPlay
              muted
              loop
              playsInline
              preload={preload}
              data-testid='native-video'
            />
          )}
        </div>
      )}
    </main>,
    serverRendered
  );
};
