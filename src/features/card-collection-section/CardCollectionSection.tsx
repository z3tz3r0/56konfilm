import { ModeGuard } from '@shared/components';
import { CardCollectionSectionBlock } from '@features/card-collection-section/types';
import { SiteMode } from '@shared/config';
import { Production, Wedding } from './components';

interface CardCollectionSectionProps {
  block: CardCollectionSectionBlock;
  mode: SiteMode;
}

function CardCollectionSection({ block, mode }: CardCollectionSectionProps) {
  const baseProps = { block, mode };

  return (
    <ModeGuard
      ProductionComponent={Production}
      WeddingComponent={Wedding}
      mode={mode}
      props={baseProps}
    />
  );
}

export default CardCollectionSection;
export type { CardCollectionSectionProps };
