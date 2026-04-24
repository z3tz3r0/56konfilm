import { ModeGuard } from '@shared/components';
import { CardCollectionSectionBlock } from '@features/card-collection-section/types';
import { SiteMode } from '@shared/config';
import { Production, Wedding } from './components';

interface CardCollectionSectionProps {
  block: CardCollectionSectionBlock;
  mode: SiteMode;
}

function getColumnsClass(columns?: number) {
  const columnMap: Record<number, string> = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };

  return columnMap[columns || 4] || columnMap[4];
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
export { getColumnsClass };
export type { CardCollectionSectionProps };
