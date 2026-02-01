import { cookies } from 'next/headers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const lang = cookies().get('lang')?.value || 'en';
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
