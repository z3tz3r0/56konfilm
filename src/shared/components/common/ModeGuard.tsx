import { SiteMode } from '@shared/config';
import { ComponentType } from 'react';

interface ModeRendererProps<T> {
  mode: SiteMode;
  WeddingComponent: ComponentType<T>;
  ProductionComponent: ComponentType<T>;
  props: T;
}

export default function ModeGuard<T extends object>({
  mode,
  WeddingComponent,
  ProductionComponent,
  props,
}: ModeRendererProps<T>) {
  const isWedding = mode === 'wedding';
  return isWedding ? (
    <WeddingComponent {...props} />
  ) : (
    <ProductionComponent {...props} />
  );
}
