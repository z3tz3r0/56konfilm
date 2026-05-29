'use client';

import {
  Button,
  CarouselContent,
  CarouselItem,
  ScrollableCarousel,
} from '@shared/components';
import { Locale, SiteMode } from '@shared/config';
import { ProjectTag } from '@shared/types';
import { cn } from '@shared/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface PortfolioFilterProps {
  lang: Locale;
  mode: SiteMode;
  tags: ProjectTag[];
}

export default function PortfolioFilter({
  lang,
  mode,
  tags,
}: PortfolioFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag') || 'all';

  const activeHoverClass =
    'hover:not-disabled:bg-primary dark:hover:not-disabled:text-primary-foreground';

  const handleTagChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug === 'all') {
      params.delete('tag');
    } else {
      params.set('tag', slug);
    }

    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <ScrollableCarousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className='w-full'
    >
      <CarouselContent className='px-1 py-4'>
        {/* ปุ่ม All Projects */}
        <CarouselItem className='basis-auto pl-4'>
          <Button
            onClick={() => handleTagChange('all')}
            size={'lg'}
            variant={
              currentTag === 'all'
                ? 'default'
                : mode === 'production'
                  ? 'neutral'
                  : 'secondary'
            }
            className={cn(
              'shrink-0',
              currentTag !== 'all' ? activeHoverClass : ''
            )}
          >
            {lang === 'en' ? 'All Projects' : 'โปรเจกต์ทั้งหมด'}
          </Button>
        </CarouselItem>

        {/* ปุ่ม Tags จากฐานข้อมูล */}
        {tags.map((tag) => (
          <CarouselItem key={tag._id} className='basis-auto pl-4 last:pr-4'>
            <Button
              onClick={() => handleTagChange(tag.slug)}
              size={'lg'}
              variant={
                currentTag === tag.slug
                  ? 'default'
                  : mode === 'production'
                    ? 'neutral'
                    : 'secondary'
              }
              className={cn(
                'shrink-0',
                currentTag !== tag.slug ? activeHoverClass : ''
              )}
            >
              {tag.title}
            </Button>
          </CarouselItem>
        ))}
      </CarouselContent>
    </ScrollableCarousel>
  );
}
