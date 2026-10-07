import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Hit by Vercel Cron every 6 hours (see vercel.json) so the numbers stay fresh
 * even when nobody has opened the page. Protected by REVALIDATE_SECRET.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const auth = req.headers.get('authorization');
  const provided = auth?.replace(/^Bearer /, '') ?? req.nextUrl.searchParams.get('secret');

  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 });
  }

  revalidatePath('/api/metrics');
  revalidatePath('/');
  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
