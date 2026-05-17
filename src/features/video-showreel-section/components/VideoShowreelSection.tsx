'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SectionShell, SectionHeader } from '@shared/components';
import { AspectRatio } from '@shared/components/ui/aspect-ratio';
import { urlFor } from '@/sanity/lib/image';
import { VideoShowreelSectionBlock } from '../types';

function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // YouTube
    if (
      parsed.hostname.includes('youtube.com') ||
      parsed.hostname.includes('youtu.be')
    ) {
      const videoId =
        parsed.searchParams.get('v') ?? parsed.pathname.split('/').pop();
      return videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
        : null;
    }
    // Vimeo
    if (parsed.hostname.includes('vimeo.com')) {
      const videoId = parsed.pathname.split('/').pop();
      return videoId
        ? `https://player.vimeo.com/video/${videoId}?autoplay=1`
        : null;
    }
  } catch {
    return null;
  }
  return null;
}

interface VideoShowreelSectionProps {
  block: VideoShowreelSectionBlock;
}

export default function VideoShowreelSection({
  block,
}: VideoShowreelSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = block.videoUrl ? getEmbedUrl(block.videoUrl) : null;

  return (
    <SectionShell
      background={block.background}
      dataTestId="video-showreel-section"
    >
      <div className="container mx-auto max-w-5xl">
        {block.heading && (
          <SectionHeader
            heading={block.heading}
            className="mx-auto mb-10 max-w-3xl text-center"
          />
        )}
        <div className="overflow-hidden rounded-lg">
          <AspectRatio ratio={16 / 9}>
            {isPlaying && embedUrl ? (
              <iframe
                src={embedUrl}
                title={block.caption ?? 'Video showreel'}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="group relative size-full cursor-pointer"
                aria-label="Play video"
                data-testid="showreel-play"
              >
                {block.thumbnail && (
                  <Image
                    src={urlFor(block.thumbnail)
                      .width(1280)
                      .height(720)
                      .fit('crop')
                      .url()}
                    alt={block.caption ?? 'Video thumbnail'}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(min-width: 1024px) 1024px, 100vw"
                  />
                )}
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-300 group-hover:bg-black/20">
                  <div className="flex size-16 items-center justify-center rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 md:size-20">
                    <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      className="ml-1 size-6 md:size-8"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            )}
          </AspectRatio>
        </div>
        {block.caption && (
          <p className="text-muted-foreground mt-4 text-center text-sm">
            {block.caption}
          </p>
        )}
      </div>
    </SectionShell>
  );
}
