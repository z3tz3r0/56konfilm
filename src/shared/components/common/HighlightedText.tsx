interface HighlightedTextProps {
  text: string;
  className: string;
}

export default function HighlightedText({
  text,
  className,
}: HighlightedTextProps) {
  if (!text) return null;

  // ใช้ Regex ผ่าข้อความ ค้นหาสิ่งที่อยู่ใน [ ]
  // การใช้ (.*?) จะทำให้ข้อความที่ถูกผ่า ถูกเก็บไว้ใน Array ด้วย
  const parts = text.split(/\[(.*?)\]/g);
  const highlightedText = () =>
    parts.map((part, index) => {
      // Regex จะแบ่ง Array โดยให้ Index ที่เป็นเลขคี่ (1, 3, 5) คือข้อความที่อยู่ใน [ ]
      if (index % 2 === 1) {
        return (
          <span key={index} className={'dark:text-primary'}>
            {part}
          </span>
        );
      }
      // ข้อความปกติ (Index เลขคู่)
      return <span key={index}>{part}</span>;
    });

  return <h2 className={className}>{highlightedText()}</h2>;
}
