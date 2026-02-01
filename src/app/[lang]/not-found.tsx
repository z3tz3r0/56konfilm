import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          404
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="max-w-lg text-sm text-muted-foreground md:text-base">
          หน้าที่คุณพยายามเข้าถึงอาจถูกลบ ย้ายไปที่อื่น หรือยังไม่ได้ถูกสร้างขึ้น
          ลองกลับไปหน้าแรกหรือเลือกหน้าอื่นจากเมนูด้านบน
        </p>
      </div>
      <Button asChild variant="secondary">
        <Link href="/">กลับสู่หน้าแรก</Link>
      </Button>
    </main>
  );
}
