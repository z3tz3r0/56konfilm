import { redirect } from 'next/navigation';

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
