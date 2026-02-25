import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import ChangePasswordForm from './ChangePasswordForm';

export const metadata = {
  title: 'Change Password | 56KonFilm CMS',
  description: 'Change your CMS password',
};

export default async function ChangePasswordPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sanity-cms-session')?.value;

  if (!token) {
    redirect('/sanity-cms/login');
  }

  const session = verifySession(token);

  if (!session.valid) {
    redirect('/sanity-cms/login');
  }

  return <ChangePasswordForm />;
}
