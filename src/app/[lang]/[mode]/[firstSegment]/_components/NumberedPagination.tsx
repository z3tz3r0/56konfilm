'use client';

import { setPortfolioLimitCookie } from '@/app/[lang]/[mode]/[firstSegment]/_actions/portfolioCookie';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components';
import { Locale } from '@shared/config';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface NumberedPaginationProps {
  lang: Locale;
  currentPage: number;
  currentLimit: number;
  totalPages: number;
}

export default function NumberedPagination({
  lang,
  currentPage,
  currentLimit,
  totalPages,
}: NumberedPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const disabledClass = 'pointer-events-none opacity-50';
  const pageLabel = localizePageLabel(lang);

  // Silent URL Sync
  useEffect(() => {
    // เช็กว่า: ถ้าใน URL ปัจจุบัน "ไม่มี" พารามิเตอร์ limit
    // แปลว่า Server เพิ่งดึงค่ามาจาก Cookie (หรือค่า Default) มาให้
    if (!searchParams.has('limit') && currentLimit) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('limit', currentLimit.toString());

      // 🚨 ใช้ .replace() เพื่อเปลี่ยน URL ทันทีโดยไม่สร้าง History ซ้ำซ้อน
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, currentLimit, pathname, router]);

  // ฟังก์ชันสร้าง URL สำหรับหน้าต่างๆ โดยเก็บรักษา Query Params เดิมไว้ (เช่น ?tag=wedding)
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleLimitChange = async (newLimit: string) => {
    await setPortfolioLimitCookie(newLimit);

    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newLimit);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  // Logic สร้าง Array ของตัวเลขหน้า (แสดง ... ถ้ายาวเกินไป)
  const generatePagination = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [
        1,
        2,
        '...',
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ];
  };

  const allPages = generatePagination();

  const pageNumber = () =>
    allPages.map((page, index) => {
      if (page === '...') {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const isCurrentPage = page === currentPage;
      return (
        <PaginationItem key={`page-${page}`} className='hidden md:block'>
          <PaginationLink
            size={'md'}
            href={createPageURL(page)}
            isActive={isCurrentPage}
            className='rounded'
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    });

  return (
    <section className='flex items-center justify-between gap-4 md:justify-end'>
      <PageIndicator
        lang={lang}
        currentPage={currentPage}
        totalPages={totalPages}
        className='hidden md:block'
      />
      <Pagination className='mx-0 w-fit'>
        <PaginationContent>
          {/* ปุ่ม Previous */}
          <PaginationItem>
            <PaginationPrevious
              size={'md'}
              showText={false}
              href={currentPage > 1 ? createPageURL(currentPage - 1) : '#'}
              aria-disabled={currentPage <= 1}
              tabIndex={currentPage <= 1 ? -1 : undefined}
              onClick={
                currentPage <= 1 ? (event) => event.preventDefault() : undefined
              }
              className={currentPage <= 1 ? disabledClass : ''}
            />
          </PaginationItem>

          {/* ตัวเลขหน้า */}
          {pageNumber()}
          <PageIndicator
            lang={lang}
            currentPage={currentPage}
            totalPages={totalPages}
            className='block md:hidden'
          />

          {/* ปุ่ม Next */}
          <PaginationItem>
            <PaginationNext
              size={'md'}
              showText={false}
              href={
                currentPage < totalPages ? createPageURL(currentPage + 1) : '#'
              }
              aria-disabled={currentPage >= totalPages}
              tabIndex={currentPage >= totalPages ? -1 : undefined}
              onClick={
                currentPage >= totalPages
                  ? (event) => event.preventDefault()
                  : undefined
              }
              className={currentPage >= totalPages ? disabledClass : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Select value={currentLimit.toString()} onValueChange={handleLimitChange}>
        <SelectTrigger className='w-[120px]'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectGroup>
            <SelectItem value='6'>6 / {pageLabel}</SelectItem>
            <SelectItem value='15'>15 / {pageLabel}</SelectItem>
            <SelectItem value='30'>30 / {pageLabel}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </section>
  );
}

interface PageIndicatorProps {
  lang: Locale;
  currentPage: string | number;
  totalPages: string | number;
  className?: string;
}

function PageIndicator({
  lang,
  currentPage,
  totalPages,
  className,
}: PageIndicatorProps) {
  const pageLabel = localizePageLabel(lang);
  return (
    <p className={className}>
      {pageLabel} {currentPage.toString()} of {totalPages.toString()}
    </p>
  );
}

function localizePageLabel(lang: Locale) {
  return lang === 'en' ? 'Page' : 'หน้า';
}
