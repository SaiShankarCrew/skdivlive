import { InstagramData, SourceResult } from '../types';
import { getJson, isoDaysAgo, notConfigured, result, safe } from '../util';

/**
 * Meta renames insight metrics between Graph API versions. "impressions" became
 * "views" in v22. We ask for the newer name and fall back rather than failing.
 */
const METRIC_SETS = [
  ['views', 'reach', 'total_interactions'],
  ['impressions', 'reach', 'total_interactions'],
  ['reach'],
];

export async function getInstagram(): Promise<SourceResult<InstagramData>> {
  const id = process.env.INSTAGRAM_USER_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const version = process.env.INSTAGRAM_GRAPH_VERSION || 'v21.0';
  const provenance = 'Instagram Graph API, live';

  if (!id || !token) {
    return notConfigured<InstagramData>(
      'Add INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN. Until then the dashboard falls back to the numbers in data/manual.json.',
      provenance
    );
  }

  const base = 'https://graph.facebook.com/' + version;

  return safe('instagram', provenance, async () => {
    const profile = await getJson(
      base + '/' + id + '?fields=username,followers_count,media_count&access_token=' + token
    );

    let views: number | null = null;
    let reach: number | null = null;
    let interactions: number | null = null;

    const since = isoDaysAgo(30);
    const until = isoDaysAgo(0);

    for (const set of METRIC_SETS) {
      try {
        const insights = await getJson(
          base + '/' + id + '/insights?metric=' + set.join(',') +
          '&metric_type=total_value&period=day&since=' + since + '&until=' + until +
          '&access_token=' + token
        );
        for (const row of insights.data || []) {
          const value = row.total_value?.value ?? null;
          if (row.name === 'views' || row.name === 'impressions') views = value;
          if (row.name === 'reach') reach = value;
          if (row.name === 'total_interactions') interactions = value;
        }
        break;
      } catch (err) {
        // Try the next metric spelling before giving up.
        continue;
      }
    }

    const media = await getJson(
      base + '/' + id + '/media?limit=25&fields=id,caption,permalink,timestamp,like_count,comments_count' +
      '&access_token=' + token
    );

    const topMedia = (media.data || []).map((m: any) => ({
      id: m.id,
      caption: (m.caption || '').split('\n')[0].slice(0, 120),
      permalink: m.permalink,
      timestamp: m.timestamp,
      likes: Number(m.like_count ?? 0),
      comments: Number(m.comments_count ?? 0),
      views: null,
    }));

    return result<InstagramData>('ok', {
      username: profile.username,
      followers: Number(profile.followers_count ?? 0),
      mediaCount: Number(profile.media_count ?? 0),
      periodLabel: 'Last 30 days',
      views,
      reach,
      interactions,
      topMedia,
    }, provenance);
  });
}
