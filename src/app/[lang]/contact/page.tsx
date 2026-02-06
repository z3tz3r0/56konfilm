import { ContactForm } from '@/components/features/contact/ContactForm';
import SectionShell from '@/components/page/SectionShell';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'th' ? 'ติดต่อเรา - 56Konfilm' : 'Contact Us - 56Konfilm',
    description: lang === 'th' 
      ? 'ติดต่อ 56Konfilm สำหรับโปรดักชั่นโฆษณาหรือถ่ายภาพแต่งงาน' 
      : 'Contact 56Konfilm for commercial production or wedding photography.',
  };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  return (
    <SectionShell 
      className="py-20 min-h-[80vh] flex items-center justify-center"
    >
      <div className="w-full max-w-4xl">
         <ContactForm lang={lang as 'en' | 'th'} />
      </div>
    </SectionShell>
  );
}
