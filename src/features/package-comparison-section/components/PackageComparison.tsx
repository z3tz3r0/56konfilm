'use client';

import {
  Suspense,
  useCallback,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { useReducedMotion } from 'motion/react';
import { CheckIcon, InfoIcon } from 'lucide-react';
import {
  AppTooltip,
  Button,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
} from '@shared/components';
import type { Locale, SiteMode } from '@shared/config/preferences';
import { useDeviceTier } from '@shared/hooks';
import type { ComparisonGroup } from '../types/packageComparisonBlock.types';
import PackageHeader from './PackageHeader';
import PackageGroupControls from './PackageGroupControls';
import PackageGroupUrlReader from './PackageGroupUrlReader';
import ComparisonScrollport from './ComparisonScrollport';
import ComparisonStickyHeader from './ComparisonStickyHeader';
import { packageGroupUrl } from '../utils/packageGroupUrl';
import { cn } from '@shared/utils/styling/tailwindUtils';
import styles from '../packageComparison.module.css';

const copy = {
  en: {
    chooseGroup: 'Choose a package group',
    comparison: 'Package comparison',
    included: 'Included',
    notIncluded: 'Not included',
    information: 'More information about',
  },
  th: {
    chooseGroup: 'เลือกกลุ่มแพ็กเกจ',
    comparison: 'เปรียบเทียบแพ็กเกจ',
    included: 'รวมในแพ็กเกจ',
    notIncluded: 'ไม่รวมในแพ็กเกจ',
    information: 'รายละเอียดเพิ่มเติมเกี่ยวกับ',
  },
} satisfies Record<Locale, Record<string, string>>;

interface PackageComparisonProps {
  sectionKey?: string;
  groups: ComparisonGroup[];
  lang: Locale;
  mode: SiteMode;
  caption?: string;
}

/** Renders group selection and an accessible comparison table with URL and sticky header support. */
export default function PackageComparison({
  sectionKey,
  groups,
  lang,
  mode,
  caption,
}: PackageComparisonProps) {
  const [selectedKey, setSelectedKey] = useState(groups[0]._key);
  const selected = useRef(groups[0]._key);
  const activeGroup =
    groups.find((group) => group._key === selectedKey) ?? groups[0];
  const scrollContainer = useRef<HTMLDivElement>(null);
  const id = useId();
  const { allowHeavyMotion, isInitialized } = useDeviceTier();
  const reducedMotion = useReducedMotion();
  const animate = isInitialized && allowHeavyMotion && !reducedMotion;
  const labels = copy[lang];
  const hasGroupBadge = activeGroup.packages.some((item) =>
    item.badgeLabel?.trim()
  );
  const lastUrl = useRef<{
    slug: string | null;
    pathname: string;
    groups: ComparisonGroup[];
  } | null>(null);

  /** Changes the selected group and resets horizontal scrolling only when the key changes. */
  const changeGroup = useCallback((value: string) => {
    if (value === selected.current) return;
    selected.current = value;
    if (scrollContainer.current) scrollContainer.current.scrollLeft = 0;
    setSelectedKey(value);
  }, []);

  /** Selects the group matching the URL slug, falling back to the first group. */
  const readUrl = useCallback(
    (slug: string | null, pathname: string) => {
      const previous = lastUrl.current;
      if (
        previous?.slug === slug &&
        previous.pathname === pathname &&
        previous.groups === groups
      )
        return;
      lastUrl.current = { slug, pathname, groups };
      const group =
        (slug && groups.find((item) => item.slug === slug)) || groups[0];
      changeGroup(group._key);
    },
    [groups, changeGroup]
  );

  /** Selects a group and replaces its URL parameter while preserving history state. */
  function selectGroup(value: string) {
    const group = groups.find((item) => item._key === value);
    if (!group || value === activeGroup._key) return;
    changeGroup(value);
    if (!sectionKey) return;
    // Record our own write so a legacy group's missing slug retains local selection.
    lastUrl.current = {
      slug: group.slug || null,
      pathname: window.location.pathname,
      groups,
    };
    window.history.replaceState(
      window.history.state,
      '',
      packageGroupUrl(window.location.href, sectionKey, group.slug)
    );
  }

  return (
    <Tabs
      value={activeGroup._key}
      onValueChange={selectGroup}
      className={cn(styles.content, 'min-w-0 gap-8')}
    >
      {sectionKey ? (
        <Suspense fallback={null}>
          <PackageGroupUrlReader sectionKey={sectionKey} onChange={readUrl} />
        </Suspense>
      ) : null}
      <PackageGroupControls
        groups={groups}
        activeGroup={activeGroup}
        label={labels.chooseGroup}
        animate={animate}
        onChange={selectGroup}
      />

      <TabsContent
        value={activeGroup._key}
        className={cn(styles.tableLane, 'w-full min-w-0')}
        aria-label={activeGroup.label}
      >
        <div className={styles.tableFrame}>
          <ComparisonStickyHeader
            scrollRef={scrollContainer}
            group={activeGroup}
            hasGroupBadge={hasGroupBadge}
            lang={lang}
            mode={mode}
            label={labels.comparison}
            id={id}
            reducedMotion={!!reducedMotion}
          >
            <ComparisonScrollport
              scrollRef={scrollContainer}
              groupKey={activeGroup._key}
              id={`${id}-scrollport`}
              label={`${labels.comparison} — ${activeGroup.label}`}
              lang={lang}
              reducedMotion={!!reducedMotion}
            >
              <div className={styles.tableTrack}>
                <Table
                  variant='comparison'
                  className={styles.comparisonTable}
                  containerClassName='max-w-none justify-self-center overflow-visible'
                  role='table'
                  style={
                    {
                      '--comparison-column-count':
                        activeGroup.packages.length + 1,
                      '--comparison-header-rows': hasGroupBadge ? 3 : 2,
                    } as CSSProperties
                  }
                >
                  <TableCaption className='sr-only'>
                    {caption || labels.comparison} — {activeGroup.label}
                  </TableCaption>
                  <TableHeader className={styles.rowGroup} role='rowgroup'>
                    <TableRow
                      className={cn(styles.gridRow, styles.headerRow)}
                      role='row'
                    >
                      <TableHead
                        scope='col'
                        className={styles.cornerHead}
                        role='columnheader'
                      >
                        <span className='text-2xl font-medium'>
                          {labels.comparison}
                        </span>
                      </TableHead>
                      {activeGroup.packages.map((packageData, index) => (
                        <TableHead
                          key={packageData._id}
                          scope='col'
                          id={`${id}-package-${packageData._id}`}
                          className={styles.packageHead}
                          role='columnheader'
                          style={{ gridColumn: index + 2 }}
                        >
                          <PackageHeader
                            packageData={packageData}
                            lang={lang}
                            mode={mode}
                            hasGroupBadge={hasGroupBadge}
                          />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className={styles.rowGroup} role='rowgroup'>
                    {activeGroup.rows.map((row) => (
                      <TableRow
                        key={row._id}
                        className={styles.gridRow}
                        role='row'
                      >
                        <TableHead
                          scope='row'
                          id={`${id}-service-${row._id}`}
                          role='rowheader'
                        >
                          <div className='flex items-center gap-2'>
                            <span className='whitespace-pre-line'>
                              {row.title}
                            </span>
                            {row.information?.trim() ? (
                              <AppTooltip content={row.information}>
                                <Button
                                  type='button'
                                  variant='information'
                                  size='icon-sm'
                                  aria-label={`${labels.information} ${row.title ?? ''}`}
                                >
                                  <InfoIcon aria-hidden='true' />
                                </Button>
                              </AppTooltip>
                            ) : null}
                          </div>
                        </TableHead>
                        {activeGroup.packages.map((packageData) => {
                          const included =
                            packageData.serviceIds?.includes(row._id) ?? false;
                          return (
                            <TableCell
                              key={packageData._id}
                              headers={`${id}-package-${packageData._id} ${id}-service-${row._id}`}
                              role='cell'
                            >
                              {included ? (
                                <CheckIcon
                                  aria-hidden='true'
                                  className='text-text-secondary mx-auto size-6'
                                />
                              ) : (
                                <span
                                  aria-hidden='true'
                                  className='text-text-secondary text-xl'
                                >
                                  -
                                </span>
                              )}
                              <span className='sr-only'>
                                {included
                                  ? labels.included
                                  : labels.notIncluded}
                              </span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ComparisonScrollport>
          </ComparisonStickyHeader>
        </div>
      </TabsContent>
    </Tabs>
  );
}
