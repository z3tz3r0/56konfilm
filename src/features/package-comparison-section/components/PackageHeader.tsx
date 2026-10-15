import { Badge, CtaButton } from '@shared/components';
import type { Locale, SiteMode } from '@shared/config/preferences';
import type { ComparisonPackage } from '../types/packageComparisonBlock.types';
import { cn } from '@shared/utils/styling/tailwindUtils';

interface PackageHeaderProps {
  packageData: ComparisonPackage;
  lang: Locale;
  mode: SiteMode;
  hasGroupBadge: boolean;
  presentation?: boolean;
}

/** Renders CMS header content; the comparison table controls cell alignment. */
export default function PackageHeader({
  packageData,
  lang,
  mode,
  hasGroupBadge,
  presentation = false,
}: PackageHeaderProps) {
  const { _id, title, badgeLabel, price, currency, cta } = packageData;
  const formattedPrice =
    typeof price === 'number' && Number.isFinite(price)
      ? new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US').format(price)
      : undefined;

  return (
    <div
      className={cn(
        'grid grid-rows-subgrid gap-4',
        hasGroupBadge ? 'row-span-3' : 'row-span-2'
      )}
      data-testid='comparison-package-header'
      data-package-id={_id}
      role={presentation ? 'group' : undefined}
      aria-label={
        presentation
          ? title || (lang === 'th' ? 'แพ็กเกจ' : 'Package')
          : undefined
      }
    >
      {badgeLabel?.trim() ? (
        <Badge
          variant='secondary'
          size='lg'
          className='row-start-1 justify-self-center'
          aria-hidden={presentation || undefined}
        >
          {badgeLabel}
        </Badge>
      ) : null}
      <div
        aria-hidden={presentation || undefined}
        className={cn(
          'grid grid-rows-[1fr_auto] gap-2',
          hasGroupBadge ? 'row-start-2' : 'row-start-1'
        )}
      >
        {title ? (
          <p
            data-testid='comparison-package-title'
            className='row-start-1 text-2xl leading-tight font-medium whitespace-pre-line'
          >
            {title}
          </p>
        ) : null}
        {formattedPrice !== undefined || currency ? (
          <p
            data-testid='comparison-package-price'
            className='row-start-2 text-[1.75rem] leading-tight font-bold'
          >
            {[formattedPrice, currency]
              .filter(
                (value) => value !== undefined && value !== null && value !== ''
              )
              .join(' ')}
          </p>
        ) : null}
      </div>
      {cta ? (
        <div
          data-testid='comparison-package-cta'
          className={cn(
            'self-center justify-self-center',
            hasGroupBadge ? 'row-start-3' : 'row-start-2'
          )}
        >
          <CtaButton ctaButton={cta} lang={lang} mode={mode} />
        </div>
      ) : null}
    </div>
  );
}
