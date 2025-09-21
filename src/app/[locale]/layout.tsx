import Navbar from '@/components/Navbar';
import { ReactNode } from 'react';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  return (
    // <html> และ <body> ถูกย้ายไปที่ Root Layout หลักแล้ว
    // ที่นี่เราจะ return แค่ส่วนที่อยู่ภายใน body
    <>
      <Navbar locale={locale} />
      <main className="container mx-auto px-4">{children}</main>
      {/* อาจจะมี Footer ที่นี่ */}
    </>
  );
}
