'use client';

import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@shared/components';
import type { Locale } from '@shared/config/preferences';
import { cn } from '@shared/utils/styling/tailwindUtils';
import styles from '../packageComparison.module.css';

const INTERACTIVE =
  'a, button, input, select, textarea, summary, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="link"], [role="combobox"], [data-no-scroll-drag]';
const DRAG_THRESHOLD = 6;

interface ComparisonScrollportProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  groupKey: string;
  id: string;
  label: string;
  lang: Locale;
  reducedMotion: boolean;
  children: ReactNode;
}

/** Adds mouse dragging to native scrolling; touch and child controls stay native. */
export default function ComparisonScrollport({
  scrollRef,
  groupKey,
  id,
  label,
  lang,
  reducedMotion,
  children,
}: ComparisonScrollportProps) {
  const [position, setPosition] = useState({ previous: false, next: false });
  const [dragging, setDragging] = useState(false);
  const overflowing = position.previous || position.next;

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    let mounted = true;
    let gesture: {
      pointerId: number;
      x: number;
      y: number;
      scroll: number;
      dragging: boolean;
    } | null = null;
    let suppressClick = false;
    let clickTimer: number | undefined;

    function measure() {
      if (!mounted || !element) return;
      const max = element.scrollWidth - element.clientWidth;
      if (max <= 1) finish(true);
      const previous = max > 1 && element.scrollLeft > 1;
      const next = max > 1 && element.scrollLeft < max - 1;
      setPosition((current) =>
        current.previous === previous && current.next === next
          ? current
          : { previous, next }
      );
    }

    function finish(cancelled = false) {
      if (!gesture || !element) return;
      const current = gesture;
      gesture = null;
      if (current.dragging) {
        if (mounted) setDragging(false);
        suppressClick = !cancelled;
        // The compatibility click follows pointerup; don't suppress a later click.
        clickTimer = window.setTimeout(() => (suppressClick = false), 0);
      }
      if (element.hasPointerCapture?.(current.pointerId))
        element.releasePointerCapture(current.pointerId);
    }

    function down(event: PointerEvent) {
      if (
        !element ||
        event.defaultPrevented ||
        event.pointerType !== 'mouse' ||
        event.isPrimary === false ||
        event.button !== 0 ||
        element.scrollWidth - element.clientWidth <= 1 ||
        (event.target instanceof Element && event.target.closest(INTERACTIVE))
      )
        return;
      finish(true);
      window.clearTimeout(clickTimer);
      suppressClick = false;
      gesture = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        scroll: element.scrollLeft,
        dragging: false,
      };
    }

    function move(event: PointerEvent) {
      if (!gesture || !element || event.pointerId !== gesture.pointerId) return;
      const x = event.clientX - gesture.x;
      const y = event.clientY - gesture.y;
      if (!gesture.dragging) {
        if (Math.abs(y) >= DRAG_THRESHOLD && Math.abs(y) > Math.abs(x)) {
          finish(true);
          return;
        }
        if (Math.abs(x) < DRAG_THRESHOLD || Math.abs(x) <= Math.abs(y)) return;
        gesture.dragging = true;
        element.setPointerCapture?.(event.pointerId);
        element.focus({ preventScroll: true });
        setDragging(true);
      }
      event.preventDefault();
      // Remove only a selection made inside this scrollport while dragging.
      const selection = window.getSelection();
      if (
        selection?.anchorNode &&
        selection.focusNode &&
        element.contains(selection.anchorNode) &&
        element.contains(selection.focusNode)
      )
        selection.removeAllRanges();
      element.scrollLeft = gesture.scroll - x;
    }

    function up(event: PointerEvent) {
      if (event.pointerId === gesture?.pointerId) finish();
    }
    function cancel() {
      finish(true);
    }
    function click(event: MouseEvent) {
      if (!suppressClick || event.detail === 0) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    element.addEventListener('scroll', measure, { passive: true });
    element.addEventListener('pointerdown', down);
    element.addEventListener('lostpointercapture', cancel);
    element.addEventListener('click', click, true);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', cancel);
    window.addEventListener('resize', measure);
    document.fonts?.addEventListener('loadingdone', measure);
    document.fonts?.ready.then(measure);
    measure();

    return () => {
      finish(true);
      mounted = false;
      window.clearTimeout(clickTimer);
      observer.disconnect();
      element.removeEventListener('scroll', measure);
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('lostpointercapture', cancel);
      element.removeEventListener('click', click, true);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', cancel);
      window.removeEventListener('resize', measure);
      document.fonts?.removeEventListener('loadingdone', measure);
    };
  }, [groupKey, scrollRef]);

  function scroll(direction: number) {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.8,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }

  return (
    <>
      <div
        ref={scrollRef}
        id={id}
        className={styles.scrollport}
        data-testid='comparison-scrollport'
        data-overflow={overflowing}
        data-dragging={dragging}
        tabIndex={0}
        role='region'
        aria-label={label}
      >
        {children}
      </div>
      {overflowing ? (
        <div className={cn(styles.content, 'mt-4 flex justify-end gap-2')}>
          <Button
            type='button'
            variant='secondary'
            size='icon'
            className='rounded-full'
            aria-label={
              lang === 'th' ? 'เลื่อนตารางไปทางซ้าย' : 'Scroll comparison left'
            }
            aria-controls={id}
            disabled={!position.previous}
            onClick={() => scroll(-1)}
          >
            <ArrowLeft aria-hidden='true' />
          </Button>
          <Button
            type='button'
            variant='secondary'
            size='icon'
            className='rounded-full'
            aria-label={
              lang === 'th' ? 'เลื่อนตารางไปทางขวา' : 'Scroll comparison right'
            }
            aria-controls={id}
            disabled={!position.next}
            onClick={() => scroll(1)}
          >
            <ArrowRight aria-hidden='true' />
          </Button>
        </div>
      ) : null}
    </>
  );
}
