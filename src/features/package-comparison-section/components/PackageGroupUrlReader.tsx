'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { packageGroupParameter } from '../utils/packageGroupUrl';

interface PackageGroupUrlReaderProps {
  sectionKey: string;
  onChange: (slug: string | null, pathname: string) => void;
}

/** Keep the search-params suspension boundary separate from the prerendered table. */
export default function PackageGroupUrlReader({
  sectionKey,
  onChange,
}: PackageGroupUrlReaderProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const slug = searchParams.get(packageGroupParameter(sectionKey));

  useEffect(() => {
    onChange(slug, pathname);
  }, [slug, pathname, onChange]);

  return null;
}
