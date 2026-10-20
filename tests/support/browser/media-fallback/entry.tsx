import { createRoot } from 'react-dom/client';
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

const root = createRoot(document.getElementById('root')!);

window.showMediaFixture = async ({
  mode = 'production',
  lang = 'en',
  mediaType = 'image',
  state = 'source-missing',
  frame = false,
  consumer,
  videoAutoplay = true,
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
    root.render(
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
        : `https://media.fixture.test/${state}.${mediaType === 'image' ? 'svg' : 'webm'}`;
  root.render(
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
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              data-testid='native-video'
            />
          )}
        </div>
      )}
    </main>
  );
};
