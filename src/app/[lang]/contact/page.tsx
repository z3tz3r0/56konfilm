import { ContactForm } from '@/components/features/contact/ContactForm';
import SectionShell from '@/components/page/SectionShell';
import { buildMetadata } from '@/lib/metadata';
import { sanityFetch } from '@/sanity/lib/fetch';
import { pageBySlugQuery, settingsQuery } from '@/sanity/lib/queries';
import { PageDocument } from '@/types/sanity';
import { SiteSettings } from '@/types/siteSettings';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const [settings, page] = await Promise.all([
    sanityFetch<SiteSettings | null>({
      query: settingsQuery,
      params: { lang },
      tags: ['settings'],
    }),
    sanityFetch<PageDocument | null>({
      query: pageBySlugQuery,
      params: { slug: 'contact', lang, mode: 'production' },
      tags: ['page', 'contact'],
    }),
  ]);

  const fallbackTitle = lang === 'th' ? 'ติดต่อเรา - 56Konfilm' : 'Contact Us - 56Konfilm';

  return buildMetadata({
    lang,
    pathname: `/${lang}/contact`,
    title: page?.title || fallbackTitle,
    seo: page?.seo,
    fallbackSeo: settings?.seo,
    fallbackTitle: settings?.siteTitle,
    siteTitle: settings?.siteTitle,
  });
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
