import MediaGallerySection from '@features/media-gallery-section/MediaGallerySection';
import TwoColumnSection from '@features/two-column-section/TwoColumnSection';
import ProjectHero from '@shared/components/layout/project-detail/ProjectHero';
import PortableTextRenderer from '@shared/components/common/PortableTextRenderer';
import VideoShowreelSection from '@features/video-showreel-section/components/VideoShowreelSection';
import VideoItem from '@features/media-gallery-section/components/grid/VideoItem';
import { MotionProvider } from '@shared/providers/MotionProvider';
import { fixtureImage } from './mediaFixtures';
import type { FixtureOptions } from './types';

/** Exercise actual section components and frames, not copies of their layout. */
export default function ContentMediaFixture({
  consumer,
  mode = 'production',
  lang = 'en',
  state = 'source-missing',
}: FixtureOptions) {
  const image = fixtureImage(state);
  const heading = { heading: 'Fixture heading', body: 'Fixture body' };
  const media = { image, alt: 'Fixture content' };
  const portableNodes = [
    { ...image, _type: 'image', _key: 'item', alt: 'Fixture content' },
  ];
  let content;
  switch (consumer) {
    case 'grid':
    case 'collage':
      content = (
        <MediaGallerySection
          block={{
            _type: 'mediaGallerySection',
            sectionVariant: consumer === 'collage' ? 'collage' : 'grid',
            heading,
            items: [{ _key: 'item', media, label: 'Fixture caption' }],
            collageImages: {
              smallPortrait: media,
              landscape: media,
              largePortrait: media,
            },
          }}
          lang={lang}
          mode={mode}
        />
      );
      break;
    case 'two-column':
      content = (
        <TwoColumnSection
          block={{
            _type: 'twoColumnSection',
            sectionVariant: 'standard',
            content: heading,
            media,
          }}
          lang={lang}
          mode={mode}
        />
      );
      break;
    case 'hero':
      content = (
        <ProjectHero
          lang={lang}
          projectTitle='Fixture content'
          coverImage={image}
        />
      );
      break;
    case 'portable-text':
      content = <PortableTextRenderer lang={lang} value={portableNodes} />;
      break;
    case 'showreel':
      content = (
        <VideoShowreelSection
          lang={lang}
          block={{
            _type: 'videoShowreelSection',
            heading,
            thumbnail: image,
            caption: 'Fixture caption',
            videoUrl: 'https://youtu.be/fixture',
          }}
        />
      );
      break;
    case 'gallery-video':
      content = (
        <div className='relative mx-auto aspect-video w-full max-w-[480px]'>
          <VideoItem
            lang={lang}
            src={
              state === 'source-missing'
                ? undefined
                : `https://media.fixture.test/${state}.webm`
            }
          />
        </div>
      );
      break;
  }
  return <MotionProvider>{content}</MotionProvider>;
}
