'use client';

import { useDeviceTier } from '@shared/hooks';
import { RotatingText } from '@shared/components';
import { cn } from '@shared/utils';

interface DynamicRotatingTextProps {
  rotatingWords: string[];
}

export default function DynamicRotatingText({
  rotatingWords,
}: DynamicRotatingTextProps) {
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const baseStyleClass =
    'bg-primary text-primary-foreground dark:text-foreground rounded-lg px-2 py-0.5 sm:py-1 md:px-3 md:py-2';

  // 1. 🎯 สำหรับ SEO / Googlebot / ช่วงแรกที่ Server เรนเดอร์ (isInitialized === false)
  // ให้แสดงผลแค่ "คำแรกคำเดียว" นิ่งๆ ไปก่อน โดยใช้สไตล์กล่องแบบเดียวกับแอนิเมชันเป๊ะๆ
  if (!isInitialized) {
    return (
      <span className={cn(baseStyleClass, 'inline-flex')}>
        {rotatingWords[0]}
      </span>
    );
  }

  // 2. ⚡ สำหรับเครื่องสเปกต่ำ / เปิดโหมดประหยัดพลังงาน (allowHeavyMotion === false)
  // รันแอนิเมชันแบบสลับ "ทีละคำ" และปิดทิศทางการเลื่อนแกน Y ให้เหลือแค่การจางเข้า-ออก (Fade Opacity)
  // วิธีนี้ประหยัด CPU มาก เครื่องไม่กระตุก และความหมายของแบรนด์ยังอยู่ครบถ้วนครับ
  if (!allowHeavyMotion) {
    return (
      <RotatingText
        texts={rotatingWords}
        rotationInterval={2500}
        splitBy='words' // เปลี่ยนมาขยับทั้งคำ ลด DOM nodes
        initial={{ opacity: 0, y: 0 }} // อยู่กับที่ ไม่เลื่อนขึ้นลง เพื่อลดภาระการคำนวณพิกเซล
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.3, ease: 'linear' }} // ใช้ fade ธรรมดาแทนระบบสปริง
        mainClassName={cn(baseStyleClass, 'overflow-hidden justify-center')}
      />
    );
  }

  // 3. 🔥 สำหรับเครื่องสเปกสูง (รันเต็มประสิทธิภาพตามค่าดั้งเดิมของคุณ)
  return (
    <RotatingText
      texts={rotatingWords}
      rotationInterval={2500}
      staggerDuration={0.025}
      staggerFrom={'random'}
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      mainClassName={cn(baseStyleClass, 'overflow-hidden justify-center')}
    />
  );
}
