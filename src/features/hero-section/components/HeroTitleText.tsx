import { RotatingText } from '@shared/components';

interface HeroTitleTextProps {
  text: string;
  enableRotatingText?: boolean;
  rotatingWords?: string[];
  className?: string;
}

export default function HeroTitleText({
  text,
  className,
  enableRotatingText = false,
  rotatingWords = [],
}: HeroTitleTextProps) {
  if (!text) return null;

  const parts = text.split(/\[(.*?)\]/g);
  const titleWithRotatingEffect = () =>
    parts.map((part, index) => {
      // Index เลขคี่ คือตำแหน่งของข้อความที่อยู่ในวงเล็บ [ ]
      if (index % 2 === 1) {
        // เช็กเงื่อนไข: ถ้าเปิดใช้งานสลับคำ + มีคำใน Array มากกว่า 1 คำ
        if (enableRotatingText && rotatingWords.length > 1) {
          return (
            // โยน Array คำเข้าไปใน Component สลับคำของคุณ
            <RotatingText
              key={index}
              texts={rotatingWords}
              rotationInterval={2500}
              staggerDuration={0.025}
              staggerFrom={'random'}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              mainClassName='w-fit px-2 sm:px-2 md:px-3 bg-primary text-primary-foreground dark:text-foreground overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg'
            />
          );
        }

        // Fallback: ถ้าไม่ได้เปิดสลับคำ ให้แสดงผลข้อความในวงเล็บตามปกติ
        // (หรือจะใส่ Class Highlight แบบโค้ดเดิมของคุณก็ได้ครับ)
        return (
          <span key={index} className='text-primary'>
            {part}
          </span>
        );
      }

      // ข้อความปกติ (Index เลขคู่)
      return <span key={index}>{part}</span>;
    });

  return <h1 className={className}>{titleWithRotatingEffect()}</h1>;
}
