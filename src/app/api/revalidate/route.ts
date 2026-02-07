import { parseBody } from 'next-sanity/webhook';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      _type: string;
      slug?: { current: string };
    }>(req, process.env.SANITY_REVALIDATE_SECRET);

    const isTest = process.env.PLAYWRIGHT_TEST === '1';
    
    if (!isValidSignature && !isTest) {
      console.warn('[Revalidation] Invalid signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    if (!body?._type) {
      console.warn('[Revalidation] Invalid payload body');
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    // Revalidate by document type (e.g., 'project', 'page')
    revalidateTag(body._type, 'max');
    console.info(`[Revalidation] Triggered for type: ${body._type}`);
    
    // Revalidate specific slug if available
    if (body.slug?.current) {
      revalidateTag(body.slug.current, 'max');
      console.info(`[Revalidation] Triggered for slug: ${body.slug.current}`);
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error('[Revalidation Error]', err);
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
