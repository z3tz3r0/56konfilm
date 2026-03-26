import Link from 'next/link';
import { Button } from '@shared/components';
import { cn } from '@shared/utils';
import { ContentCta } from '@shared/types';
import { Locale, SiteMode } from '@shared/config';
import { withContextPrefix } from '@shared/lib/url';

interface CtaButtonProps {
  cta: ContentCta;
  lang?: Locale;
  mode: SiteMode;
  className?: string;
  fullWidth?: boolean;
}

export default function CtaButton({
  cta,
  lang = 'en',
  mode,
  className,
  fullWidth,
}: CtaButtonProps) {
  if (!cta?.label) {
    return null;
  }

  const { href, isExternal } = resolveCta(cta, lang, mode);
  const variant = mapCtaVariant(cta.style);

  return (
    <Link
      href={href ?? '#'}
      className={cn(fullWidth && 'block w-full')}
      {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      <Button
        variant={variant}
        className={cn(fullWidth && 'w-full justify-center', className)}
      >
        {cta.label}
      </Button>
    </Link>
  );
}

function resolveCta(
  cta: ContentCta,
  lang: Locale,
  mode: SiteMode
): {
  href: string | null;
  isExternal: boolean;
} {
  if (cta.linkType === 'external' && cta.externalUrl) {
    return { href: cta.externalUrl, isExternal: true };
  }

  if (cta.linkType === 'internal' && cta.pageRef?.slug) {
    return {
      href: withContextPrefix({ href: `/${cta.pageRef.slug}`, lang, mode }),
      isExternal: false,
    };
  }

  return { href: null, isExternal: false };
}

function mapCtaVariant(style: ContentCta['style']) {
  switch (style) {
    case 'secondary':
      return 'secondary' as const;
    case 'link':
      return 'link' as const;
    default:
      return 'default' as const;
  }
}
