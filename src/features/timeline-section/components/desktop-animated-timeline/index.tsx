'use client';

import { useRef } from 'react';
import { TimelineStep } from '@features/timeline-section/types';
import { m, useScroll, useTransform } from 'motion/react';
import StepRow from './StepRow';

interface DesktopAnimatedTimelineProps {
  steps: TimelineStep[];
}

export default function DesktopAnimatedTimeline({
  steps,
}: DesktopAnimatedTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. จับ Scroll บอร์ดใหญ่บอร์ดเดียว ยาวตั้งแต่หัวจรดท้าย
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'center center'], // ปรับขอบเขตให้ยาวและเนียนตามการกลิ้งเมาส์
  });

  // 2. เส้นแนวตั้งหลัก (เส้นเดียวอยู่ภายนอก) ยิ่งเลื่อนยิ่งงอกลงมาเรื่อยๆ
  // ใช้สูตรรถสปอร์ตออกตัว (Ease-In): ช่วงแรกไปช้า ช่วงท้ายพุ่งไว
  const mainVerticalFill = useTransform(
    scrollYProgress,
    [0, 0.2, 0.5, 0.8, 1],
    ['0%', '5%', '25%', '65%', '100%']
  );

  return (
    <div ref={containerRef} className='relative hidden md:block'>
      {/* 📍 เส้นหลักแนวตั้ง */}
      <div
        aria-hidden='true'
        className='absolute top-4 bottom-6 left-1/2 -z-10 w-[2px] -translate-x-1/2'
      >
        <m.div
          style={{ height: mainVerticalFill }}
          className='bg-primary w-full origin-top'
        />
      </div>

      <ol className='space-y-24'>
        {steps.map((step, index) => (
          <StepRow key={step._key ?? index} step={step} index={index} />
        ))}
      </ol>
    </div>
  );
}
