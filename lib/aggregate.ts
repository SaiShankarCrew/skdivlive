import { Metrics, SourceResult } from './types';
import { result } from './util';
import { getYouTube } from './providers/youtube';
import { getInstagram } from './providers/instagram';
import { getTikTok } from './providers/tiktok';
import { getSpotify } from './providers/spotify';
import { getApple } from './providers/apple';
import manual from '../data/manual.json';

type Manual30 = Metrics['instagram30Day'];
type Manual30Data = NonNullable<Manual30['data']>;

function instagram30Day(): Manual30 {
  const m: any = (manual as any).instagram30Day;
  if (!m?.enabled) {
    return result<Manual30Data>('not_configured', null, 'Instagram Insights, entered by hand',
      'No 30 day figures on file. Add them to data/manual.json.');
  }
  return result<Manual30Data>('manual', {
    periodLabel: m.periodLabel,
    views: m.views,
    viewers: m.viewers,
    viewerGrowthPct: m.viewerGrowthPct,
    followerViewPct: m.followerViewPct,
    nonFollowerViewPct: m.nonFollowerViewPct,
    reelsSharePct: m.reelsSharePct,
  }, 'Instagram Insights, read ' + m.readOn + ', entered by hand');
}

export async function getMetrics(): Promise<Metrics> {
  const [youtube, instagram, tiktok, spotify, apple] = await Promise.all([
    getYouTube(),
    getInstagram(),
    getTikTok(),
    getSpotify(),
    getApple(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    youtube,
    instagram,
    instagram30Day: instagram30Day(),
    tiktok,
    spotify,
    apple,
  };
}
