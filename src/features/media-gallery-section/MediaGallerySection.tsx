import { ModeGuard } from '@shared/components';
import Collage from './components/collage/Collage';
import Grid from './components/grid/Grid';
import type { MediaGalleryPresentationProps } from './types/presentation.types';

function Wedding(props: MediaGalleryPresentationProps) {
  return props.block.sectionVariant === 'collage' ? (
    <Collage {...props} />
  ) : (
    <Grid {...props} />
  );
}

export default function MediaGallerySection(
  props: MediaGalleryPresentationProps
) {
  return (
    <ModeGuard
      ProductionComponent={Grid}
      WeddingComponent={Wedding}
      mode={props.mode}
      props={props}
    />
  );
}
