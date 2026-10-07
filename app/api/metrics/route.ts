import { NextResponse } from 'next/server';
import { getMetrics } from '../../../lib/aggregate';

// Regenerated at most every 5 minutes. The client polls this endpoint, so the
// page updates itself without anyone reloading, and the upstream APIs are not
// hammered once the site gets traffic.
export const revalidate = 300;
export const dynamic = 'force-static';

export async function GET() {
  const metrics = await getMetrics();
  return NextResponse.json(metrics, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
    },
  });
}
