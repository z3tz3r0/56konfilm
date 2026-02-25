import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Works',
  robots: { index: false },
};

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

export default async function WorksProjectPage({ params }: PageProps) {
  const { lang, slug } = await params;
  redirect(`/${lang}/work/${slug}`);
}
