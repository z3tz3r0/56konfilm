import type { ImageProps } from 'next/image';
import type { ComponentPropsWithRef, Ref } from 'react';
import type { Locale } from '@shared/config/preferences';

export type MediaStatus = 'source-missing' | 'loading' | 'success' | 'error';

/** An upstream URL-resolution failure must not look like an omitted asset. */
export type MediaSource<T> = T | { readonly error: true } | null | undefined;

export type ResolvedMediaSource<T> =
  | { status: 'source-missing' | 'error'; src?: never; key: string }
  | { status: 'loading'; src: T; key: string };

interface MediaCommonProps {
  lang: Locale;
  containerClassName?: string;
}

export type ImageMediaProps = MediaCommonProps &
  Omit<ImageProps, 'src'> & {
    mediaType: 'image';
    source: MediaSource<ImageProps['src']>;
    ref?: Ref<HTMLImageElement>;
  };

export type VideoMediaProps = MediaCommonProps &
  Omit<ComponentPropsWithRef<'video'>, 'src' | 'children'> & {
    mediaType: 'video';
    source: MediaSource<string>;
    mimeType?: string;
    posterAlt?: string;
  };

export type MediaWithFallbackProps = ImageMediaProps | VideoMediaProps;
