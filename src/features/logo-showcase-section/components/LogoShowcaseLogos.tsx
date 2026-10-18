'use client';

import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, LogoLoop } from '@shared/components';
import { useDeviceTier } from '@shared/hooks/useDeviceTier';
import type { Locale } from '@shared/config/preferences';
import { cn } from '@shared/utils/styling/tailwindUtils';
import { useShowcaseReducedMotion } from '../hooks/useShowcaseReducedMotion';
import type { ShowcaseLogo } from '../types/logoShowcase.types';

const copy = {
  en: {
    pause: 'Pause logo animation',
    play: 'Play logo animation',
    logos: 'Client logos',
  },
  th: {
    pause: 'หยุดภาพเคลื่อนไหวโลโก้',
    play: 'เล่นภาพเคลื่อนไหวโลโก้',
    logos: 'โลโก้ลูกค้า',
  },
};

/** One shared control; loops keep their identities and offsets across pause/resume. */
export default function LogoShowcaseLogos({
  logos,
  lang,
}: {
  logos: ShowcaseLogo[];
  lang: Locale;
}) {
  const { isInitialized, allowHeavyMotion } = useDeviceTier();
  const reducedMotion = useShowcaseReducedMotion();
  const [paused, setPaused] = useState(false);
  const animated = isInitialized && allowHeavyMotion && !reducedMotion;
  const staticGrid = reducedMotion || (isInitialized && !allowHeavyMotion);
  const rows = useMemo(() => {
    const split = Math.ceil(logos.length / 2);
    return logos.length <= 6
      ? [logos]
      : [logos.slice(0, split), logos.slice(split)];
  }, [logos]);
  const loopRows = useMemo(
    () =>
      rows.map((row) =>
        row.map((logo) => ({
          node: (
            <span className='relative block h-9 w-24'>
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes='96px'
                className='object-contain'
                draggable={false}
              />
            </span>
          ),
          ariaLabel: logo.alt,
        }))
      ),
    [rows]
  );
  if (logos.length === 0) return null;

  return (
    <div className='min-w-0' data-testid='logo-showcase-logos'>
      {/* CSS handles reduced motion before hydration and while the subscription updates. */}
      <div
        className={cn(
          'flex flex-col gap-10',
          animated && 'hidden motion-reduce:flex'
        )}
        data-testid='logo-showcase-static'
      >
        {rows.map((row, index) => (
          <ul
            key={index}
            aria-label={copy[lang].logos}
            className={cn(
              'm-0 list-none items-center p-0 motion-reduce:grid motion-reduce:grid-cols-[repeat(auto-fit,minmax(6rem,1fr))] motion-reduce:gap-8 motion-reduce:overflow-visible',
              staticGrid
                ? 'grid grid-cols-[repeat(auto-fit,minmax(6rem,1fr))] gap-8'
                : 'flex gap-[72px] overflow-x-auto'
            )}
          >
            {row.map((logo) => (
              <li key={logo.id} className='relative mx-auto h-9 w-24 shrink-0'>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  sizes='96px'
                  className='object-contain'
                  draggable={false}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
      {animated && (
        <div
          className='flex flex-col gap-10 motion-reduce:hidden'
          data-testid='logo-showcase-loops'
        >
          {loopRows.map((row, index) => (
            <LogoLoop
              key={index}
              logos={row}
              speed={20}
              direction={index === 0 ? 'right' : 'left'}
              layout='line'
              logoHeight={36}
              gap={72}
              muted={0.6}
              scaleOnHover={false}
              intro
              draggable
              fadeOut
              fadeOutWidth={0.12}
              hoverSpeed={0}
              paused={paused}
              ariaLabel={copy[lang].logos}
            />
          ))}
        </div>
      )}
      <div className='mt-6 flex h-12 justify-center motion-reduce:hidden'>
        {animated && (
          <Button
            type='button'
            variant='information'
            size='icon'
            aria-label={paused ? copy[lang].play : copy[lang].pause}
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? (
              <Play aria-hidden='true' />
            ) : (
              <Pause aria-hidden='true' />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
