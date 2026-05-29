'use server';

import { cookies } from 'next/headers';

export async function setPortfolioLimitCookie(limit: string) {
  const cookieStore = await cookies();

  cookieStore.set('portfolio_limit', limit, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 ปี
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
