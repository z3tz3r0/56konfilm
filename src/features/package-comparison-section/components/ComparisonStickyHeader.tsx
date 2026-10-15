'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import type { Locale, SiteMode } from '@shared/config/preferences';
import type { ComparisonGroup } from '../types/packageComparisonBlock.types';
import { cn } from '@shared/utils/styling/tailwindUtils';
import ComparisonScrollport from './ComparisonScrollport';
import PackageHeader from './PackageHeader';
import styles from '../packageComparison.module.css';

interface Measurements {
  group: string;
  width: number;
  headerHeight: number;
  tableHeight: number;
  rows: string;
  gap: string;
  borderBottom: string;
  cells: { width: number; style: CSSProperties }[];
}

interface Props {
  scrollRef: RefObject<HTMLDivElement | null>;
  group: ComparisonGroup;
  hasGroupBadge: boolean;
  lang: Locale;
  mode: SiteMode;
  label: string;
  id: string;
  reducedMotion: boolean;
  children: ReactNode;
}

/** A viewport-sticky copy, bounded by the real table and paired with its CTAs. */
export default function ComparisonStickyHeader({
  scrollRef,
  group,
  hasGroupBadge,
  lang,
  mode,
  label,
  id,
  reducedMotion,
  children,
}: Props) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const stickyScrollRef = useRef<HTMLDivElement>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const measured = useRef<Measurements | null>(null);
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const pendingFocus = useRef<{ packageId: string; tag: string } | null>(null);
  const lastFocus = useRef<{
    packageId: string;
    tag: string;
    node: HTMLElement;
  } | null>(null);

  useLayoutEffect(() => {
    const scrollport = scrollRef.current;
    const boundary = boundaryRef.current;
    const header = scrollport?.querySelector('thead');
    const card = scrollport?.querySelector('[data-slot="table-container"]');
    const row = header?.querySelector('tr');
    if (!scrollport || !boundary || !header || !card || !row) return;
    const media = window.matchMedia('(min-width: 48rem)');
    let frame = 0;
    let fullMeasurement = false;
    let mounted = true;

    /** Remembers the focused package CTA so focus can survive header or group changes. */
    function rememberFocus() {
      const node = document.activeElement;
      const cta =
        node instanceof HTMLElement
          ? node.closest('[data-testid="comparison-package-cta"]')
          : null;
      const packageId =
        cta?.closest<HTMLElement>('[data-package-id]')?.dataset.packageId;
      if (packageId && node instanceof HTMLElement && boundary?.contains(node))
        lastFocus.current = {
          packageId,
          tag: node.tagName.toLowerCase(),
          node,
        };
      else lastFocus.current = null;
    }

    /** Updates sticky visibility within table bounds and records any CTA focus to transfer. */
    function updateActive() {
      if (!mounted || !card) return;
      const geometry = card.getBoundingClientRect();
      const inset =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--navbar-visible-height'
          )
        ) || 0;
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const current = measured.current;
      const next =
        !media.matches &&
        !!current &&
        current.group === group._key &&
        current.headerHeight > 0 &&
        current.headerHeight < viewportHeight - inset &&
        geometry.top < inset - 0.5 &&
        geometry.bottom > inset + 0.5;
      if (
        next !== activeRef.current ||
        (lastFocus.current &&
          !lastFocus.current.node.isConnected &&
          document.activeElement === document.body)
      ) {
        const node = document.activeElement;
        const cta =
          node instanceof HTMLElement
            ? node.closest('[data-testid="comparison-package-cta"]')
            : null;
        const packageId =
          cta?.closest<HTMLElement>('[data-package-id]')?.dataset.packageId;
        if (
          packageId &&
          node instanceof HTMLElement &&
          boundary?.contains(node)
        )
          pendingFocus.current = { packageId, tag: node.tagName.toLowerCase() };
        else if (
          document.activeElement === document.body &&
          lastFocus.current &&
          !lastFocus.current.node.isConnected
        )
          pendingFocus.current = lastFocus.current;
        activeRef.current = next;
        setActive(next);
      }
    }

    /** Copies table and header geometry for the sticky view, then updates its visibility. */
    function measure() {
      if (!mounted || !scrollport || !header || !card || !row) return;
      const headerRect = header.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const tableRect = scrollport
        .querySelector('table')!
        .getBoundingClientRect();
      const rowStyle = getComputedStyle(row);
      const next: Measurements = {
        group: group._key,
        width: cardRect.width,
        headerHeight: headerRect.height + tableRect.top - cardRect.top,
        tableHeight: scrollport.getBoundingClientRect().height,
        rows: rowStyle.gridTemplateRows,
        gap: rowStyle.rowGap,
        borderBottom: rowStyle.borderBottom,
        cells: [...row.children].map((cell) => {
          const style = getComputedStyle(cell);
          return {
            width: cell.getBoundingClientRect().width,
            style: {
              paddingTop: style.paddingTop,
              paddingBottom: style.paddingBottom,
              paddingLeft: style.paddingLeft,
              paddingRight: style.paddingRight,
              borderRight: style.borderRight,
            },
          };
        }),
      };
      measured.current = next;
      setMeasurements((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next
      );
      updateActive();
    }

    /** Coalesces geometry or visibility updates into the next animation frame. */
    function scheduleFrame() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (fullMeasurement) {
          fullMeasurement = false;
          measure();
        } else updateActive();
      });
    }

    /** Requests a full geometry measurement on the next animation frame. */
    function scheduleMeasure() {
      fullMeasurement = true;
      scheduleFrame();
    }
    /** Requests a visibility update on the next animation frame. */
    function scheduleBounds() {
      scheduleFrame();
    }

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(scrollport);
    observer.observe(header);
    observer.observe(card);
    const navbar = new MutationObserver(scheduleMeasure);
    navbar.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class', 'data-mode'],
    });
    window.addEventListener('scroll', scheduleBounds, { passive: true });
    window.addEventListener('resize', scheduleMeasure);
    window.visualViewport?.addEventListener('resize', scheduleMeasure);
    media.addEventListener('change', scheduleMeasure);
    document.fonts?.addEventListener('loadingdone', scheduleMeasure);
    document.fonts?.ready.then(() => {
      if (mounted) scheduleMeasure();
    });
    document.addEventListener('focusin', rememberFocus);
    measure();

    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      navbar.disconnect();
      window.removeEventListener('scroll', scheduleBounds);
      window.removeEventListener('resize', scheduleMeasure);
      window.visualViewport?.removeEventListener('resize', scheduleMeasure);
      media.removeEventListener('change', scheduleMeasure);
      document.fonts?.removeEventListener('loadingdone', scheduleMeasure);
      document.removeEventListener('focusin', rememberFocus);
      header.removeAttribute('data-sticky-active');
      header
        .querySelectorAll('[data-testid="comparison-package-cta"]')
        .forEach((cta) => {
          cta.removeAttribute('inert');
          cta.removeAttribute('aria-hidden');
        });
    };
  }, [group, lang, mode, scrollRef]);

  const visible = active && measurements?.group === group._key;
  useLayoutEffect(() => {
    const source = scrollRef.current;
    const target = stickyScrollRef.current;
    const header = source?.querySelector('thead');
    if (header) {
      header.setAttribute('data-sticky-active', String(visible));
      header
        .querySelectorAll('[data-testid="comparison-package-cta"]')
        .forEach((cta) => {
          cta.toggleAttribute('inert', visible);
          if (visible) cta.setAttribute('aria-hidden', 'true');
          else cta.removeAttribute('aria-hidden');
        });
    }

    const focus = pendingFocus.current;
    if (focus) {
      const area = visible ? target : source;
      const packageNode =
        area &&
        [...area.querySelectorAll<HTMLElement>('[data-package-id]')].find(
          (item) => item.dataset.packageId === focus.packageId
        );
      const cta = packageNode?.querySelector(
        '[data-testid="comparison-package-cta"]'
      );
      const button =
        cta?.querySelector<HTMLElement>(focus.tag) ??
        cta?.querySelector<HTMLElement>('a, button');
      (button ?? source)?.focus({ preventScroll: true });
      pendingFocus.current = null;
    }
  }, [visible, measurements, scrollRef, group, lang, mode]);

  // Keep this connection across size-only measurements: reconnecting and
  // copying the body position could otherwise undo an in-flight header gesture.
  useLayoutEffect(() => {
    const source = scrollRef.current;
    const target = stickyScrollRef.current;
    // Native scroll events are asynchronous. Ignore our own writes so an old
    // echo cannot overwrite a newer gesture on the other scrollport.
    let bodyWrite: number | null = null;
    let headerWrite: number | null = null;
    /** Copies body scrolling to the sticky header while ignoring echoes of prior writes. */
    const fromBody = () => {
      if (!source || !target) return;
      const value = source.scrollLeft;
      const echo = bodyWrite !== null && Math.abs(value - bodyWrite) < 0.5;
      bodyWrite = null;
      if (echo || Math.abs(value - target.scrollLeft) <= 0.5) return;
      target.scrollLeft = value;
      headerWrite = target.scrollLeft;
    };
    /** Copies sticky header scrolling to the body while ignoring echoes of prior writes. */
    const fromHeader = () => {
      if (!source || !target) return;
      const value = target.scrollLeft;
      const echo = headerWrite !== null && Math.abs(value - headerWrite) < 0.5;
      headerWrite = null;
      if (echo || Math.abs(value - source.scrollLeft) <= 0.5) return;
      source.scrollLeft = value;
      bodyWrite = source.scrollLeft;
    };
    if (source && target) {
      if (Math.abs(target.scrollLeft - source.scrollLeft) > 0.5) {
        target.scrollLeft = source.scrollLeft;
        headerWrite = target.scrollLeft;
      }
      source.addEventListener('scroll', fromBody, { passive: true });
      target.addEventListener('scroll', fromHeader, { passive: true });
    }
    return () => {
      source?.removeEventListener('scroll', fromBody);
      target?.removeEventListener('scroll', fromHeader);
    };
  }, [visible, scrollRef, group._key]);

  return (
    <div ref={boundaryRef} className={styles.tableBoundary}>
      {measurements && measurements.group === group._key ? (
        <div
          className={styles.stickyOverlay}
          style={{ blockSize: measurements.tableHeight }}
        >
          <div
            className={styles.stickyHeader}
            data-active={visible}
            data-testid='comparison-sticky-header'
            aria-hidden={!visible}
            inert={!visible}
            style={{ blockSize: measurements.headerHeight }}
          >
            {visible ? (
              <ComparisonScrollport
                scrollRef={stickyScrollRef}
                groupKey={group._key}
                id={`${id}-sticky`}
                label={
                  lang === 'th'
                    ? 'หัวตารางแพ็กเกจ'
                    : 'Package comparison header'
                }
                lang={lang}
                reducedMotion={reducedMotion}
                showControls={false}
                testId='comparison-sticky-scrollport'
              >
                <div className={styles.tableTrack}>
                  <div
                    className={cn(
                      styles.stickyCard,
                      'justify-self-center text-base font-medium'
                    )}
                    style={{
                      inlineSize: measurements.width,
                      gridTemplateColumns: measurements.cells
                        .map((cell) => `${cell.width}px`)
                        .join(' '),
                    }}
                  >
                    <div
                      className={cn(styles.gridRow, styles.headerRow)}
                      style={{
                        gridTemplateRows: measurements.rows,
                        rowGap: measurements.gap,
                        borderBottom: measurements.borderBottom,
                      }}
                    >
                      <div
                        className={cn(styles.stickyCell, styles.cornerHead)}
                        style={measurements.cells[0]?.style}
                        aria-hidden='true'
                      >
                        <span className='text-2xl font-medium'>{label}</span>
                      </div>
                      {group.packages.map((item, index) => (
                        <div
                          key={item._id}
                          className={cn(styles.stickyCell, styles.packageHead)}
                          style={{
                            ...measurements.cells[index + 1]?.style,
                            gridColumn: index + 2,
                          }}
                        >
                          <PackageHeader
                            packageData={item}
                            hasGroupBadge={hasGroupBadge}
                            lang={lang}
                            mode={mode}
                            presentation
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ComparisonScrollport>
            ) : null}
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
