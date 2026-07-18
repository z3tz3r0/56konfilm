'use client';

import TimelineCard from '@features/timeline-section/components/TimelineCard';
import { TimelineStep } from '@features/timeline-section/types';
import { cn } from '@shared/utils';
import { m, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

interface StepRowProps {
  step: TimelineStep;
  index: number;
}

export default function StepRow({ step, index }: StepRowProps) {
  const rowRef = useRef<HTMLLIElement>(null);
  const isEven = index % 2 === 0;

  // แต่ละแถวจะแอบตรวจ scroll ของตัวเองสั้นๆ เพื่อสั่งให้ "จุดและเส้นแนวนอน" งอก
  const { scrollYProgress: rowProgress } = useScroll({
    target: rowRef,
    offset: ['start 80%', 'center center'],
  });

  // อนิเมชันสำหรับจุดกลมตรงกลาง
  const markerScale = useTransform(rowProgress, [0.5, 0.6], [0.8, 1.2]);

  // อนิเมชันเส้นแนวนอนวิ่งออกข้างแบบรถออกตัว
  const connectorWidth = useTransform(
    rowProgress,
    [0.3, 0.6, 1],
    ['0%', '20%', '100%']
  );

  return (
    <li
      ref={rowRef}
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
            style={{ width: connectorWidth }}
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
        style={{ scale: markerScale }}
        className='bg-primary ring-background absolute left-1/2 z-10 flex size-4 shrink-0 origin-center -translate-x-1/2 rounded-full shadow-sm ring-6'
      />

      {/* ฝั่งช่องว่าง */}
      <div className='w-1/2' />
    </li>
  );
}
