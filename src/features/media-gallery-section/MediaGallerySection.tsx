import { ModeGuard } from '@shared/components';
import Collage from './components/collage/Collage';
import Grid from './components/grid/Grid';
import type { MediaGalleryPresentationProps } from './types/presentation.types';

/**
 * Renders the selected Wedding gallery variant, defaulting to Grid.
 */
function Wedding(props: MediaGalleryPresentationProps) {
  return props.block.sectionVariant === 'collage' ? (
    <Collage {...props} />
  ) : (
    <Grid {...props} />
  );
}

/**
 * Selects the gallery presentation for the site mode via ModeGuard.
 */
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
