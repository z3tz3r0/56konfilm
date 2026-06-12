import Image from 'next/image';
import { m, type Variants } from 'motion/react';
import { CalendarDays } from 'lucide-react';
import { SectionShell, SectionHeader, CtaGroup } from '@shared/components';
import { urlFor } from '@/sanity/lib/image';
import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import { CACHE_TAGS, type SiteMode } from '@shared/config';
import { BlogPreviewSectionBlock, BlogPost } from '../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

async function fetchPosts(maxPosts: number, lang: string): Promise<BlogPost[]> {
  const query = groq`*[_type == "post"] | order(publishedAt desc)[0...$limit] {
    _id,
    "title": coalesce(
      title[language == $lang][0].value,
      title[language == "en"][0].value,
      title[0].value
    ),
    "slug": slug.current,
    publishedAt,
    image { asset, crop, hotspot }
  }`;
  return client.fetch<BlogPost[]>(
    query,
    { limit: maxPosts - 1, lang },
    {
      cache: 'force-cache',
      next: { revalidate: false, tags: [CACHE_TAGS.ALL_POSTS] },
    }
  );
}

interface BlogPreviewSectionProps {
  block: BlogPreviewSectionBlock;
  lang: string;
  mode?: SiteMode;
}

export default async function BlogPreviewSection({
  block,
  lang,
  mode = 'production',
}: BlogPreviewSectionProps) {
  const posts = await fetchPosts(block.maxPosts ?? 3, lang);

  if (!posts.length) return null;

  return (
    <SectionShell
      background={block.background}
      dataTestId="blog-preview-section"
    >
      <div className="container mx-auto">
        {block.heading && (
          <SectionHeader heading={block.heading} className="mb-12" />
        )}

        <m.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={containerVariants}
        >
          {posts.map((post) => {
            const imageUrl = post.image
              ? urlFor(post.image).width(800).height(500).quality(85).url()
              : null;

            const formattedDate = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString(
                  lang === 'th' ? 'th-TH' : 'en-US',
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )
              : null;

            return (
              <m.article
                key={post._id}
                className="border-border bg-card group overflow-hidden rounded-xl border transition-shadow hover:shadow-lg"
                variants={cardVariants}
                data-testid="blog-post-card"
              >
                {/* Thumbnail */}
                {imageUrl && (
                  <a
                    href={`/blog/${post.slug}`}
                    className="block overflow-hidden"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={post.title ?? ''}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </a>
                )}

                {/* Content */}
                <div className="flex flex-col gap-3 p-6">
                  {formattedDate && (
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <CalendarDays size={12} />
                      <time dateTime={post.publishedAt}>{formattedDate}</time>
                    </div>
                  )}
                  {post.title && (
                    <h3 className="text-foreground line-clamp-2 text-lg leading-snug font-semibold">
                      <a
                        href={`/blog/${post.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {post.title}
                      </a>
                    </h3>
                  )}
                </div>
              </m.article>
            );
          })}
        </m.div>

        {block.cta && (
          <div className="mt-12 flex justify-center">
            <CtaGroup
              ctas={[block.cta]}
              lang={lang as 'en' | 'th'}
              mode={mode}
            />
          </div>
        )}
      </div>
    </SectionShell>
  );
}
