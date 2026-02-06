import PageBuilder from '@/components/page/PageBuilder';
import { resolvePreferences } from '@/lib/i18nUtils';
import { client } from '@/sanity/lib/client';
import { pageBySlugQuery } from '@/sanity/lib/queries';
import { PageDocument } from '@/types/sanity';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const PAGE_REVALIDATE_SECONDS = 3600;
const IS_E2E =
  process.env.E2E_TEST === '1' ||
  process.env.NEXT_PUBLIC_E2E_TEST === '1' ||
  process.env.PLAYWRIGHT_TEST === '1';

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
  searchParams?: Promise<{
    e2e?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  return {
    alternates: {
      canonical: `/${lang}/${slug}`,
      languages: {
        en: `/en/${slug}`,
        th: `/th/${slug}`,
      },
    },
  };
}

async function fetchPageDocument(
  slug: string,
  lang: string,
  forceMock: boolean
): Promise<PageDocument | null> {
  const { mode } = await resolvePreferences();

  if ((IS_E2E || forceMock) && slug === 'about') {
    return {
      title: 'About',
      slug: 'about',
      seoTitle: 'About',
      siteMode: 'both',
      contentBlocks: [
        {
          _type: 'heroSection',
          title:
            mode === 'wedding'
              ? 'Wedding Studio Philosophy'
              : 'Production House Story',
          tagline:
            mode === 'wedding'
              ? 'Romantic, gentle, and timeless.'
              : 'Bold, technical, and cinematic.',
        },
      ],
    };
  }

  if ((IS_E2E || forceMock) && slug === 'wedding-home') {
    return {
      title: 'Wedding Home',
      slug: 'wedding-home',
      seoTitle: 'Wedding Home',
      siteMode: 'both',
      contentBlocks: [
        {
          _type: 'packagesSection',
          heading: {
            eyebrow: 'Our Packages',
            heading: 'CHOOSE YOUR STORY',
            body: 'Professional wedding film production services tailored to your emotional journey.',
          },
          packages: [
            {
              _key: 'package-1',
              title: 'Cherish Starter',
              price: 2000,
              currency: 'THB',
              features: [
                'Full-day wedding coverage',
                'Highlight film delivery',
                '1 lead filmmaker',
                'Online gallery access',
                'Basic color grading',
              ],
            },
            {
              _key: 'package-2',
              title: 'Forever Memories',
              price: 5000,
              currency: 'THB',
              featured: true,
              features: [
                'Everything in Starter',
                'Second filmmaker',
                'Extended cinematic edit',
                'Drone shots included',
                'Priority delivery',
              ],
              cta: {
                label: 'Start Now',
                style: 'secondary',
                linkType: 'internal',
                pageRef: { slug: 'contact' },
              },
            },
            {
              _key: 'package-3',
              title: 'Grand Symphony',
              price: 9000,
              currency: 'THB',
              features: [
                'Everything in Forever',
                'Same-day teaser edit',
                'Luxury album add-on',
                'Full documentary cut',
                'Dedicated producer',
              ],
            },
          ],
          background: 'default',
        },
        {
          _type: 'testimonialSection',
          heading: {
            eyebrow: 'Testimonials',
            heading: 'STORIES FROM THOSE WHO CHOSE US',
          },
          testimonials: [
            {
              _key: 'testimonial-1',
              quote: 'We felt seen and heard from the first meeting. The film captured every emotion.',
              authorName: 'Anya W.',
              authorTitle: 'Bride',
            },
            {
              _key: 'testimonial-2',
              quote: 'Our families cried watching the highlight. It was cinematic and intimate.',
              authorName: 'Marcus L.',
              authorTitle: 'Groom',
            },
            {
              _key: 'testimonial-3',
              quote: 'Absolutely stunning work. The team was calm, kind, and professional.',
              authorName: 'Pimchanok T.',
              authorTitle: 'Bride',
            },
          ],
          background: 'default',
        },
        {
          _type: 'philosophySection',
          quote: "We take our craft to heart as it's truly valuable in life",
          background: 'default',
        },
      ],
    };
  }

  const page = await client.fetch<PageDocument | null>(
    pageBySlugQuery,
    { slug, lang, mode },
    { next: { revalidate: PAGE_REVALIDATE_SECONDS } }
  );

  return page;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { lang, slug } = await params;
  const query = searchParams ? await searchParams : undefined;
  const forceMock = IS_E2E && query?.e2e === '1';

  const page = await fetchPageDocument(slug, lang, forceMock);

  if (!page) {
    notFound();
  }

  return <PageBuilder page={page} enableSignature={forceMock || IS_E2E} />;
}
