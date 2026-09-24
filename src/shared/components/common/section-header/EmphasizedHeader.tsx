import HighlightedText from '@shared/components/common/HighlightedText';
import { cn } from '@shared/utils';

interface EmphasizedHeaderProps {
  heading: string;
  alignClass?: string;
}

export default function EmphasizedHeader({
  heading,
  alignClass,
}: EmphasizedHeaderProps) {
  return (
    <div className={cn('mb-16 grid gap-4', alignClass)}>
      <HighlightedText
        text={heading}
        className='text-4xl tracking-tight text-balance md:text-5xl'
      />
      <div className='bg-titanium-white h-px w-full' />
    </div>
  );
}
