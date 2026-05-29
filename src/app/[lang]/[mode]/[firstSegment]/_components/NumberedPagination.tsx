'use client';

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
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface NumberedPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function NumberedPagination({
  currentPage,
  totalPages,
}: NumberedPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const disabledClass = 'pointer-events-none opacity-50';

  const currentLimit = searchParams.get('limit') || '6';

  // ฟังก์ชันสร้าง URL สำหรับหน้าต่างๆ โดยเก็บรักษา Query Params เดิมไว้ (เช่น ?tag=wedding)
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleLimitChange = (newLimit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newLimit);
    params.delete('page');

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
        <PaginationItem key={`page-${page}`}>
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
    <section className='flex justify-end gap-4'>
      <Pagination className='mx-0 w-fit'>
        <PaginationContent>
          {/* ปุ่ม Previous */}
          <PaginationItem>
            <PaginationPrevious
              size={'md'}
              showText={false}
              href={currentPage > 1 ? createPageURL(currentPage - 1) : '#'}
              // จัดการสถานะ Disabled ด้วย CSS และ aria-disabled
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? disabledClass : ''}
            />
          </PaginationItem>

          {/* ตัวเลขหน้า */}
          {pageNumber()}

          {/* ปุ่ม Next */}
          <PaginationItem>
            <PaginationNext
              size={'md'}
              showText={false}
              href={
                currentPage < totalPages ? createPageURL(currentPage + 1) : '#'
              }
              aria-disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? disabledClass : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Select value={currentLimit} onValueChange={handleLimitChange}>
        <SelectTrigger className='w-[120px]'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectGroup>
            <SelectItem value='6'>6 / Page</SelectItem>
            <SelectItem value='15'>15 / Page</SelectItem>
            <SelectItem value='30'>30 / Page</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </section>
  );
}
