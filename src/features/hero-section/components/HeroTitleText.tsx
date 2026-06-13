import DynamicRotatingText from './DynamicRotatingText';

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
  const validRotatingWords = rotatingWords?.filter(
    (word) => typeof word === 'string' && word.trim() !== ''
  );

  const titleWithRotatingEffect = () =>
    parts.map((part, index) => {
      // Index เลขคี่ คือตำแหน่งของข้อความที่อยู่ในวงเล็บ [ ]
      if (index % 2 === 1) {
        // เช็กเงื่อนไข: ถ้าเปิดใช้งานสลับคำ + มีคำใน Array มากกว่า 1 คำ
        if (enableRotatingText && validRotatingWords.length > 1) {
          return (
            <DynamicRotatingText
              key={index}
              rotatingWords={validRotatingWords}
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
