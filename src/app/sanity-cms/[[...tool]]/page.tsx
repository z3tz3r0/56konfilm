/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from 'next-sanity/studio';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import config from '../../../../sanity.config';

export const dynamic = 'force-dynamic'; // This is necessary for authentication system

export { metadata, viewport } from 'next-sanity/studio';

export default async function StudioPage() {
  // Check authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('sanity-cms-session')?.value;

  if (!token) {
    redirect('/sanity-cms/login');
  }

  const session = verifySession(token);

  if (!session.valid) {
    redirect('/sanity-cms/login');
  }

  return <NextStudio config={config} />;
}
