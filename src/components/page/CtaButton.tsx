import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ContentCta } from '@/types/sanity';

interface CtaButtonProps {
  cta: ContentCta;
}

export default function CtaButton({ cta }: CtaButtonProps) {
  if (!cta?.label) {
    return null;
  }

  const { href, isExternal } = resolveCta(cta);
  const variant = mapCtaVariant(cta.style);

  if (!href) {
    return (
      <span className="border-border text-muted-foreground inline-flex items-center rounded-full border px-4 py-2 text-sm">
        {cta.label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : ''}
      rel={isExternal ? 'noreferrer' : ''}
    >
      <Button variant={variant}>{cta.label}</Button>
    </Link>
  );
}

function resolveCta(cta: ContentCta): {
  href: string | null;
  isExternal: boolean;
} {
  if (cta.linkType === 'external' && cta.externalUrl) {
    return { href: cta.externalUrl, isExternal: true };
  }

  if (cta.linkType === 'internal' && cta.pageRef?.slug) {
    return { href: `/${cta.pageRef.slug}`, isExternal: false };
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
