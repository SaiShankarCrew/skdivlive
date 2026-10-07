import type { SourceResult, SourceStatus } from './types';

export function result<T>(
  status: SourceStatus,
  data: T | null,
  provenance: string,
  message?: string
): SourceResult<T> {
  return { status, data, message, provenance, fetchedAt: new Date().toISOString() };
}

export function notConfigured<T>(what: string, provenance: string): SourceResult<T> {
  return result<T>('not_configured', null, provenance, what);
}

/** Never let one dead API take the whole page down. */
export async function safe<T>(
  label: string,
  provenance: string,
  fn: () => Promise<SourceResult<T>>
): Promise<SourceResult<T>> {
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[' + label + '] ' + message);
    return result<T>('error', null, provenance, message);
  }
}

export async function getJson(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, { ...init, next: { revalidate: 0 } });
  const text = await res.text();
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error('Non JSON response (' + res.status + '): ' + text.slice(0, 180));
  }
  if (!res.ok) {
    const detail = body?.error?.message || body?.error?.error_user_msg || body?.message || res.statusText;
    throw new Error('HTTP ' + res.status + ': ' + detail);
  }
  return body;
}

export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/** ISO 8601 duration (PT1H2M3S) to seconds. */
export function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
}
