import {
  CtaButton,
  ImageWithFrame,
  SectionHeader,
  SectionShell,
} from '@shared/components';
import type { Locale } from '@shared/config';
import type { MediaItem } from '@shared/types';
import { urlFor } from '@/sanity/lib/image';
import { cn } from '@shared/utils/styling/tailwindUtils';
import { getBGVariants } from '@shared/utils/styling/styleVariants';
import AnimatedCollageImage from './AnimatedCollageImage';
import type { MediaGalleryPresentationProps } from '../../types/presentation.types';

const imageSlots = [
  {
    aspectRatio: '191 / 275',
    width: 382,
    height: 550,
    sizes:
      '(min-width: 1280px) 198px, (min-width: 1024px) 150px, (min-width: 768px) 459px, (min-width: 640px) 373px, calc(66.667vw - 53.333px)',
    className:
      'order-2 w-2/3 min-w-0 lg:col-span-2 lg:col-start-4 lg:row-span-3 lg:row-start-2 lg:w-full',
  },
  {
    aspectRatio: '523 / 306',
    width: 1046,
    height: 612,
    sizes:
      '(min-width: 1280px) 521px, (min-width: 1024px) 410px, (min-width: 768px) 704px, (min-width: 640px) 576px, calc(100vw - 64px)',
    className: 'relative w-full min-w-0 lg:ml-auto lg:mr-[7%] lg:w-[72%]',
  },
  {
    aspectRatio: '470 / 548',
    width: 940,
    height: 1096,
    sizes: '(min-width: 1280px) 467px, (min-width: 1024px) 367px, 1px',
    className:
      'hidden min-w-0 lg:absolute lg:top-12 lg:left-[7%] lg:block lg:w-[39%]',
  },
] as const;

function CollageImage({
  media,
  index,
  lang,
  revealKey,
  hasBody,
}: {
  media?: MediaItem;
  index: number;
  lang: Locale;
  revealKey: string;
  hasBody: boolean;
}) {
  const slot = imageSlots[index];
  const source = media?.image
    ? urlFor(media.image)
        .width(slot.width)
        .height(slot.height)
        .fit('crop')
        .quality(85)
        .url()
    : undefined;
  return (
    <AnimatedCollageImage
      key={`${revealKey}:${index}`}
      order={index}
      className={cn(slot.className, index === 0 && hasBody && 'lg:row-span-4')}
    >
      <ImageWithFrame
        src={source}
        alt={media?.alt ?? ''}
        imageAspectRatio={slot.aspectRatio}
        sizes={slot.sizes}
        placeholder={lang === 'th' ? 'ไม่มีรูปภาพ' : 'No Image'}
        className='shadow-none'
      />
    </AnimatedCollageImage>
  );
}

export default function Collage({
  block,
  lang,
}: MediaGalleryPresentationProps) {
  const { smallPortrait, landscape, largePortrait } = block.collageImages ?? {};
  const revealKey = JSON.stringify([
    lang,
    [smallPortrait?.image, landscape?.image, largePortrait?.image],
  ]);
  const hasBody = Boolean(block.heading?.body);
  const isContrast = block.background === 'contrast';
  const panelBackgroundClass = getBGVariants(block.background);
  const desktopAlign = {
    start: 'lg:text-left',
    center: 'lg:text-center',
    end: 'lg:text-right',
  }[block.heading?.align ?? 'start'];
  const desktopButtonAlign = {
    start: 'lg:justify-start',
    center: 'lg:justify-center',
    end: 'lg:justify-end',
  }[block.heading?.align ?? 'start'];

  return (
    <SectionShell sanityType={block._type} disablePadding className='py-16'>
      <div className='relative isolate'>
        <div
          data-testid='wedding-gallery-panel'
          className={cn(
            'grid w-full grid-cols-1 items-start justify-items-center gap-8 px-4 pt-16 pb-8 lg:ml-auto lg:w-3/5 lg:grid-cols-5 lg:justify-items-stretch lg:gap-x-4 lg:gap-y-8 lg:py-16 lg:pr-[7%] lg:pl-[15%]',
            panelBackgroundClass
          )}
        >
          <SectionHeader
            heading={block.heading}
            className={cn(
              'contents text-center',
              desktopAlign,
              isContrast &&
                '[--text-primary:var(--primary-foreground)] [--text-secondary:var(--primary-foreground)]',
              '[&>span]:font-primary [&>span]:order-1 [&>span]:col-span-full [&>span]:text-2xl [&>span]:tracking-normal lg:[&>span]:col-span-5 lg:[&>span]:row-start-1',
              '[&>h2]:order-3 [&>h2]:col-span-full lg:[&>h2]:col-span-3 lg:[&>h2]:col-start-1 lg:[&>h2]:row-start-3',
              '[&>p]:order-4 [&>p]:col-span-full lg:[&>p]:col-span-3 lg:[&>p]:col-start-1 lg:[&>p]:row-start-4'
            )}
            headingClassName='text-text-primary font-primary text-4xl font-bold leading-none text-balance wrap-break-word md:text-5xl'
            bodyClassName='text-text-secondary text-base leading-relaxed text-pretty wrap-break-word'
          />

          <CollageImage
            media={smallPortrait}
            index={0}
            lang={lang}
            revealKey={revealKey}
            hasBody={hasBody}
          />

          {block.cta && (
            <div
              className={cn(
                'order-5 flex justify-center lg:col-span-3 lg:col-start-1',
                hasBody ? 'lg:row-start-5' : 'lg:row-start-4',
                desktopButtonAlign
              )}
            >
              <CtaButton ctaButton={block.cta} mode='wedding' lang={lang} />
            </div>
          )}
        </div>

        <div className='relative w-full px-4 lg:ml-auto lg:w-3/5 lg:px-0'>
          <div
            aria-hidden='true'
            data-testid='wedding-gallery-landscape-backdrop'
            className={cn(
              'absolute inset-x-0 top-0 h-1/2',
              panelBackgroundClass
            )}
          />
          <CollageImage
            media={landscape}
            index={1}
            lang={lang}
            revealKey={revealKey}
            hasBody={hasBody}
          />
        </div>

        <CollageImage
          media={largePortrait}
          index={2}
          lang={lang}
          revealKey={revealKey}
          hasBody={hasBody}
        />
      </div>
    </SectionShell>
  );
}
