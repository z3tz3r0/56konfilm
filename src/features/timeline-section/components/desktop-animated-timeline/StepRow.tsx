'use client';

import TimelineCard from '@features/timeline-section/components/TimelineCard';
import { TimelineStep } from '@features/timeline-section/types';
import { cn } from '@shared/utils';
import { m } from 'motion/react';

interface StepRowProps {
  step: TimelineStep;
  index: number;
}

export default function StepRow({ step, index }: StepRowProps) {
  const isEven = index % 2 === 0;

  return (
    <li
      className={cn(
        'relative flex min-h-[300px] items-center md:gap-0',
        isEven ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      {/* ฝั่งกล่องเนื้อหา */}
      <div className={cn('relative w-1/2', isEven ? 'pr-12' : 'pl-12')}>
        {/* เส้นเชื่อมแนวนอน */}
        <div
          className={cn(
            'absolute top-1/2 -z-10 h-[2px] w-12 -translate-y-1/2',
            isEven ? 'right-0' : 'left-0'
          )}
        >
          <m.div
            initial={{ width: '0%' }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true, margin: '-20% 0px -40% 0px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
            className={cn(
              'bg-primary h-full',
              isEven ? 'float-right origin-right' : 'float-left origin-left'
            )}
          />
        </div>
        <TimelineCard step={step} index={index} />
      </div>

      {/* หมุดกลมตรงกลาง */}
      <m.div
        initial={{ scale: 0.6 }}
        whileInView={{ scale: 1.2 }}
        viewport={{ once: true, margin: '-20% 0px -40% 0px' }}
        transition={{
          duration: 0.3,
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        className='bg-primary ring-background absolute left-1/2 z-10 flex size-4 shrink-0 origin-center -translate-x-1/2 rounded-full shadow-sm ring-6'
      />

      {/* ฝั่งช่องว่าง */}
      <div className='w-1/2' />
    </li>
  );
}
