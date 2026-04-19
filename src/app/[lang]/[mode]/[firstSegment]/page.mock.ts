import { SiteMode } from '@shared/config';
import { FullPageDocument } from '@features/PageBuilder';

export function getMockPage(
  mode: SiteMode,
  slug: string
): FullPageDocument | null {
  // ข้อมูลหน้า About
  if (slug === 'about') {
    return {
      title: 'About',
      slug: 'about',
      seoTitle: 'About',
      seo: {
        title: 'About 56KonFilm',
        description: 'About the studio and how we create cinematic stories.',
      },
      siteMode: 'production',
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
          shapeDivider: false,
        },
      ],
    };
  }

  // ข้อมูลหน้า Wedding Home
  if (slug === 'wedding-home') {
    return {
      title: 'Wedding Home',
      slug: 'wedding-home',
      seoTitle: 'Wedding Home',
      seo: {
        title: 'Wedding Home',
        description: 'Wedding films crafted with emotion and timeless style.',
      },
      siteMode: 'wedding',
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
              quote:
                'We felt seen and heard from the first meeting. The film captured every emotion.',
              authorName: 'Anya W.',
              authorTitle: 'Bride',
            },
            {
              _key: 'testimonial-2',
              quote:
                'Our families cried watching the highlight. It was cinematic and intimate.',
              authorName: 'Marcus L.',
              authorTitle: 'Groom',
            },
            {
              _key: 'testimonial-3',
              quote:
                'Absolutely stunning work. The team was calm, kind, and professional.',
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

  return null;
}
