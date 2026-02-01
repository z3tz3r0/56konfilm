import { cookies } from 'next/headers';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'en';
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
