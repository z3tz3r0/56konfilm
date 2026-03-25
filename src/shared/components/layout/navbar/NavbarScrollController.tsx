'use client';

import { cn } from '@shared/utils';
import { ReactNode, useEffect, useEffectEvent, useRef, useState } from 'react';

interface Props {
  threshold?: number;
  children: ReactNode;
}

export default function NavbarScrollController({
  threshold = 50,
  children,
}: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const startDragY = useRef<number | null>(null);
  const startScrollY = useRef(0);
  const lastScrollY = useRef(0);

  const handleDragStart = useEffectEvent((e: TouchEvent | MouseEvent) => {
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startDragY.current = y;
    startScrollY.current = window.scrollY;
  });

  const handleDragEnd = useEffectEvent(() => {
    startDragY.current = null;
  });

  const onScroll = useEffectEvent(() => {
    const currentScrollY = window.scrollY;
    const hideDistant = threshold + 300;
    const buffer = 20;

    // --- 1. Update Background State (สี Navbar) ---
    const shouldBeScrolled = currentScrollY > threshold;
    if (isScrolled !== shouldBeScrolled) setIsScrolled(shouldBeScrolled);

    // --- 2. Determine Visibility (การซ่อน/แสดง) ---
    let nextVisible = isVisible;

    // Logic สำหรับการลาก (Drag)
    if (startDragY.current !== null) {
      const dragDiff = currentScrollY - startScrollY.current;

      if (dragDiff > buffer && currentScrollY > hideDistant) {
        nextVisible = false;
      } else {
        nextVisible = true;
      }
    }
    // Logic สำหรับการไถปกติ (Scroll & Trackpad)
    else {
      const isMovingDown = currentScrollY > lastScrollY.current;
      const isMovingUp = currentScrollY < lastScrollY.current;
      const scrollDiff = Math.abs(lastScrollY.current - currentScrollY);

      if (isMovingDown && scrollDiff > buffer && currentScrollY > hideDistant) {
        nextVisible = false;
      } else if (
        isMovingUp &&
        (scrollDiff > buffer || currentScrollY <= threshold)
      ) {
        nextVisible = true;
      }
    }

    // --- 3. Final Update (Update state เฉพาะเมื่อมีการเปลี่ยนแปลงจริงๆ) ---
    if (nextVisible !== isVisible) setIsVisible(nextVisible);
    lastScrollY.current = currentScrollY;
  });

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', handleDragStart, { passive: true });
    window.addEventListener('touchend', handleDragEnd, { passive: true });
    window.addEventListener('mousedown', handleDragStart, { passive: true });
    window.addEventListener('mouseup', handleDragEnd, { passive: true });

    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', handleDragStart);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('mousedown', handleDragStart);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, []);

  return (
    <header
      suppressHydrationWarning
      data-scrolled={isScrolled}
      data-visible={isVisible}
      className={cn(
        'group fixed z-50 w-screen transition-all duration-570 ease-[ease-out-expo] data-[visible=false]:-translate-y-full',
        isScrolled
          ? 'bg-background dark:bg-charcoal-gray/40 shadow-sm dark:backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      {children}
    </header>
  );
}
