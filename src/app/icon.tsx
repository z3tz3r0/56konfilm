import { ImageResponse } from 'next/og';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';
export const revalidate = 3600;

export default async function Icon() {
  const settings = await client.fetch<{
    favicon?: { asset?: { _ref: string } };
  }>(`*[_type == "settings"][0]{favicon}`);

  const faviconUrl = settings?.favicon
    ? urlFor(settings.favicon).width(128).height(128).fit('crop').url()
    : null;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      {faviconUrl ? (
        <img
          src={faviconUrl}
          width={64}
          height={64}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#1a1a1a',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          56
        </div>
      )}
    </div>,
    { ...size }
  );
}
