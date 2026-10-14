'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { LayoutGroup, LazyMotion, domMax, m } from 'motion/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TabsList,
  TabsTrigger,
} from '@shared/components';
import type { ComparisonGroup } from '../types/packageComparisonBlock.types';
import styles from '../packageComparison.module.css';

interface PackageGroupControlsProps {
  groups: ComparisonGroup[];
  activeGroup: ComparisonGroup;
  label: string;
  animate: boolean;
  onChange: (key: string) => void;
}

export default function PackageGroupControls({
  groups,
  activeGroup,
  label,
  animate,
  onChange,
}: PackageGroupControlsProps) {
  const [showTabs, setShowTabs] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const selectTrigger = useRef<HTMLButtonElement>(null);
  const presentation = useRef(false);
  const moveFocus = useRef(false);
  const open = useRef(false);
  const id = useId();

  useEffect(() => {
    const available = container.current;
    const tabs = list.current;
    if (!available || !tabs) return;

    const media = window.matchMedia('(min-width: 48rem)');
    let mounted = true;
    function measure() {
      if (!mounted || !available || !tabs) return;
      // CSS owns intrinsic equal column widths; observation only selects a control.
      const width = tabs.getBoundingClientRect().width;
      const fits = media.matches && width > 0 && width <= available.clientWidth;
      if (fits === presentation.current) return;

      moveFocus.current = fits
        ? document.activeElement === selectTrigger.current || open.current
        : tabs.contains(document.activeElement);
      presentation.current = fits;
      if (fits) {
        open.current = false;
        setSelectOpen(false);
      }
      setShowTabs(fits);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(available);
    observer.observe(tabs);
    media.addEventListener('change', measure);
    window.addEventListener('resize', measure);
    document.fonts?.addEventListener('loadingdone', measure);
    document.fonts?.ready.then(measure);
    measure();

    return () => {
      mounted = false;
      observer.disconnect();
      media.removeEventListener('change', measure);
      window.removeEventListener('resize', measure);
      document.fonts?.removeEventListener('loadingdone', measure);
    };
  }, [groups, label]);

  useLayoutEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    const target = showTabs
      ? list.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
      : selectTrigger.current;
    target?.focus({ preventScroll: true });
  }, [showTabs]);

  return (
    <div
      ref={container}
      className='relative flex w-full min-w-0 justify-center'
      data-testid='comparison-group-controls'
    >
      <div
        className={showTabs ? undefined : styles.measurement}
        aria-hidden={showTabs ? undefined : true}
        inert={!showTabs}
        data-testid='comparison-tabs-presentation'
      >
        <LazyMotion features={domMax}>
          <LayoutGroup id={id}>
            <TabsList
              ref={list}
              variant='segmented'
              className='inline-grid w-max auto-cols-fr grid-flow-col flex-nowrap'
              aria-label={label}
            >
              {groups.map((group) => (
                <TabsTrigger
                  key={group._key}
                  value={group._key}
                  variant='segmented'
                  className='max-w-none min-w-max [overflow-wrap:normal] whitespace-nowrap'
                >
                  {activeGroup._key === group._key ? (
                    <m.span
                      key={showTabs ? 'visible' : 'measurement'}
                      aria-hidden='true'
                      data-testid='comparison-group-highlight'
                      className='bg-primary pointer-events-none absolute inset-0 -z-10 rounded-full'
                      layoutId={
                        animate && showTabs ? 'active-group' : undefined
                      }
                      initial={false}
                      transition={
                        animate && showTabs
                          ? { type: 'spring', stiffness: 400, damping: 30 }
                          : { duration: 0 }
                      }
                    />
                  ) : null}
                  {group.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </LayoutGroup>
        </LazyMotion>
      </div>

      {!showTabs ? (
        <Select
          value={activeGroup._key}
          onValueChange={onChange}
          open={selectOpen}
          onOpenChange={(value) => {
            open.current = value;
            setSelectOpen(value);
          }}
        >
          <SelectTrigger ref={selectTrigger} variant='pill' aria-label={label}>
            <SelectValue className='min-w-0 flex-1 truncate text-center'>
              {activeGroup.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            position='popper'
            className='max-w-(--radix-select-content-available-width)'
            onCloseAutoFocus={(event) => {
              if (!presentation.current) return;
              event.preventDefault();
              list.current
                ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
                ?.focus({ preventScroll: true });
            }}
          >
            <SelectGroup>
              {groups.map((group) => (
                <SelectItem
                  key={group._key}
                  value={group._key}
                  className='[overflow-wrap:anywhere] whitespace-normal'
                >
                  {group.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
