import Link from 'next/link';
import { Button } from '@shared/components';
import { cn } from '@shared/utils';
import { ContentCta } from '@shared/types';
import { Locale, SiteMode } from '@shared/config';
import { withContextPrefix } from '@shared/lib/url';

interface CtaButtonProps {
  ctaButton: ContentCta;
  lang?: Locale;
  mode: SiteMode;
  className?: string;
  fullWidth?: boolean;
}

export default function CtaButton({
  ctaButton,
  lang = 'en',
  mode,
  className,
  fullWidth,
}: CtaButtonProps) {
  if (!ctaButton?.label) {
    return null;
  }

  const { href, isExternal } = resolveCta(ctaButton, lang, mode);
  const variant = mapCtaVariant(ctaButton.style);

  const buttonElement = (
    <Button
      variant={variant}
      className={cn(fullWidth && 'w-full justify-center', className)}
    >
      {ctaButton.label}
    </Button>
  );

  if (!href) return buttonElement;

  return (
    <Link
      href={href}
      className={cn(fullWidth && 'block w-full')}
      {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {buttonElement}
    </Link>
  );
}

function resolveCta(
  ctaButton: ContentCta,
  lang: Locale,
  mode: SiteMode
): {
  href: string | null;
  isExternal: boolean;
} {
  if (ctaButton.linkType === 'external' && ctaButton.externalUrl) {
    return { href: ctaButton.externalUrl, isExternal: true };
  }

  if (ctaButton.linkType === 'internal' && ctaButton.pageRef?.slug) {
    return {
      href: withContextPrefix({
        href: `/${ctaButton.pageRef.slug}`,
        lang,
        mode,
      }),
      isExternal: false,
    };
  }

  return { href: null, isExternal: false };
}

function mapCtaVariant(style: ContentCta['style']) {
  switch (style) {
    case 'secondary':
      return 'secondary' as const;
    case 'neutral':
      return 'neutral' as const;
    case 'link':
      return 'link' as const;
    default:
      return 'default' as const;
  }
}
