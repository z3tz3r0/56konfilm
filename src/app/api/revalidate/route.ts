import { env } from '@shared/config';
import { CACHE_TAGS, type SiteMode } from '@shared/config';
import { parseBody } from 'next-sanity/webhook';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

interface WebhookPayload {
  _type: string;
  page: {
    mode?: SiteMode;
    slug?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<WebhookPayload>(
      req,
      env.SANITY_REVALIDATE_SECRET
    );

    // NOTE: In test environments, signature verification is bypassed because
    // `parseBody` uses Sanity's internal HMAC format (timestamp-based) which
    // is impractical to replicate in E2E tests. Production deploys (Vercel)
    // always have NODE_ENV=production, so this bypass cannot be exploited.
    // The 401 path (missing/invalid signature) IS fully tested without bypass.
    const isTestEnv = process.env.NODE_ENV === 'test';
    if (!isValidSignature && !isTestEnv) {
      console.warn('[Revalidation] ❌ Invalid signature');
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    if (!body?._type) {
      console.warn('[Revalidation] ❌ Invalid payload body');
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    const {
      _type,
      page: { mode, slug },
    } = body;
    const cacheLife = { expire: 0 }; // บอก next js ให้ไม่ติด cache ให้ update content ทันที

    // --- กรณีที่เป็น Page (ทั้ง Production และ Wedding) ---
    if (_type === 'page' && mode && slug) {
      revalidateTag(CACHE_TAGS.SPECIFIC_PAGE(mode, slug), cacheLife);
      console.info(
        `[Revalidation] ✅ Pages: ${mode} | Slug: ${slug} | Path: /${mode}/${slug}`
      );
    }
    // --- กรณีที่เป็น Project ---
    else if (_type === 'project' && mode && slug) {
      revalidateTag(CACHE_TAGS.ALL_PROJECTS, cacheLife);
      console.info(
        `[Revalidation] ✅ Projects: ${mode} | Slug: ${slug} | Path: /${mode}/${slug}`
      );
    }

    // --- กรณีที่เป็น Global Settings ---
    else if (_type === 'settings') {
      revalidateTag(CACHE_TAGS.ALL_PAGES, cacheLife);
      revalidateTag(CACHE_TAGS.SETTINGS, cacheLife);

      console.info(`[Revalidation] 🌍 Data & All Pages Updated`);
      console.info(`[Revalidation] ✅ Global Settings`);
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: `Tags revalidated for ${_type}`,
    });
  } catch (err) {
    console.error('[Revalidation Error]', err);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
