'use client';

import { cn } from '@shared/utils/styling/tailwindUtils';
import {
  ReactNode,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

interface Props {
  threshold?: number;
  children: ReactNode;
}

/** Controls navbar visibility during scrolling and publishes its geometry for sticky content. */
export default function NavbarScrollController({
  threshold = 50,
  children,
}: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const headerRef = useRef<HTMLElement>(null);

  /** Publishes navbar height, visible height, and transition settings as root CSS properties. */
  const publishLayout = useEffectEvent(() => {
    const header = headerRef.current;
    if (!header) return;
    const height = header.getBoundingClientRect().height;
    const style = getComputedStyle(header);
    const root = document.documentElement.style;
    root.setProperty('--navbar-height', `${height}px`);
    root.setProperty('--navbar-visible-height', `${isVisible ? height : 0}px`);
    root.setProperty('--navbar-transition-duration', style.transitionDuration);
    root.setProperty(
      '--navbar-transition-easing',
      style.transitionTimingFunction
    );
  });

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const properties = [
      '--navbar-height',
      '--navbar-visible-height',
      '--navbar-transition-duration',
      '--navbar-transition-easing',
    ];
    const previous = properties.map((name) =>
      document.documentElement.style.getPropertyValue(name)
    );
    const observer = new ResizeObserver(publishLayout);
    observer.observe(header);
    publishLayout();
    return () => {
      observer.disconnect();
      properties.forEach((name, index) => {
        if (previous[index])
          document.documentElement.style.setProperty(name, previous[index]);
        else document.documentElement.style.removeProperty(name);
      });
    };
  }, []);

  useLayoutEffect(() => {
    publishLayout();
  }, [isVisible]);

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
      ref={headerRef}
      suppressHydrationWarning
      data-scrolled={isScrolled}
      data-visible={isVisible}
      className={cn(
        'group fixed z-50 w-screen transition-all duration-570 ease-[ease-out-expo] data-[visible=false]:-translate-y-full motion-reduce:transition-none',
        isScrolled
          ? 'bg-background dark:bg-charcoal-gray/40 shadow-sm dark:backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      {children}
    </header>
  );
}
