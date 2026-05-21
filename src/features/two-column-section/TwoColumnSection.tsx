import { getAlignmentClass } from '@shared/utils';
import { Production, Wedding } from './components';
import { TwoColumnSectionProps } from './types';
import { ModeGuard } from '@shared/components';

export default function TwoColumnSection({
  block,
  lang,
  mode,
}: TwoColumnSectionProps) {
  const isTextLeft = block.layout !== 'textRight';
  const textColumnOrder = isTextLeft ? 'md:order-1' : 'md:order-2';
  const mediaColumnOrder = isTextLeft ? 'md:order-2' : 'md:order-1';
  const alignClass = getAlignmentClass(block.content?.align);

  const baseProps = {
    block,
    lang,
    mode,
    isTextLeft,
    textColumnOrder,
    mediaColumnOrder,
    alignClass,
  };

  return (
    <ModeGuard
      ProductionComponent={Production}
      WeddingComponent={Wedding}
      mode={mode}
      props={baseProps}
    />
  );
}
