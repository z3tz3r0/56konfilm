'use server';

import { cookies } from 'next/headers';

import { SiteMode, isSupportedMode } from '@/lib/i18nUtils';

export async function setModeCookie(mode: SiteMode) {
  const nextMode = isSupportedMode(mode) ? mode : 'production';
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'mode',
    value: nextMode,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}
