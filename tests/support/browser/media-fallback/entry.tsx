import { createRoot } from 'react-dom/client';
import MediaWithFallback from '@shared/components/common/MediaWithFallback';
import ImageWithFrame from '@shared/components/common/ImageWithFrame';
import type { FixtureOptions } from './types';
import MediaCardFixture from './MediaCardFixture';

const root = createRoot(document.getElementById('root')!);

window.showMediaFixture = ({
  mode = 'production',
  lang = 'en',
  mediaType = 'image',
  state = 'source-missing',
  frame = false,
  consumer,
}: FixtureOptions) => {
  document.documentElement.dataset.mode = mode;
  document.documentElement.lang = lang;
  const source =
    state === 'source-missing'
      ? undefined
      : state === 'invalid'
        ? ({ error: true } as const)
        : `https://media.fixture.test/${state}.${mediaType === 'image' ? 'svg' : 'webm'}`;
  root.render(
    <main className='bg-background p-4'>
      {consumer ? (
        <MediaCardFixture
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
