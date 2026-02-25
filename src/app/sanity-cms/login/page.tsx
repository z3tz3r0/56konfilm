import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Login | Sanity CMS',
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
