import ImageMedia from './ImageMedia';
import VideoMedia from './VideoMedia';
import { resolveSource } from './resolveSource';
import type { MediaWithFallbackProps } from './types';

/** Public media entry; stateful leaves keep server consumers server-side. */
export default function MediaWithFallback(props: MediaWithFallbackProps) {
  if (props.mediaType === 'image') {
    const { source: input, ...imageProps } = props;
    const source = resolveSource(input);
    return (
      <ImageMedia {...imageProps} key={source.key} resolvedSource={source} />
    );
  }
  const { source: input, ...videoProps } = props;
  const source = resolveSource(input);
  return (
    <VideoMedia {...videoProps} key={source.key} resolvedSource={source} />
  );
}
