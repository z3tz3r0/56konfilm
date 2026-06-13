'use client';

import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import type { LucideProps } from 'lucide-react';

/**
 * Renders a Lucide icon by its CMS-provided name while shipping ONLY the icons
 * actually referenced, instead of the whole ~1700-icon set.
 *
 * The CMS stores PascalCase Lucide export names (e.g. "Camera", "MapPin",
 * "MessageCircle"), but `lucide-react/dynamic` keys icons by kebab-case
 * ("camera", "map-pin", "message-circle"), so we convert. Using `DynamicIcon`
 * (vs `import * as LucideIcons` + string indexing) lets the bundler tree-shake:
 * each referenced icon is a tiny lazy chunk rather than one 156 KB bundle.
 */
function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])([0-9])/g, '$1-$2')
    .toLowerCase();
}

interface DynamicLucideIconProps extends LucideProps {
  name: string;
}

export function DynamicLucideIcon({ name, ...props }: DynamicLucideIconProps) {
  if (!name) return null;
  return <DynamicIcon name={toKebabCase(name) as IconName} {...props} />;
}
