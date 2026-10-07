import { SourceResult, TikTokData } from '../types';
import { getJson, notConfigured, result, safe } from '../util';

export async function getTikTok(): Promise<SourceResult<TikTokData>> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  const provenance = 'TikTok Display API, live';

  if (!token) {
    return notConfigured<TikTokData>(
      'Needs an approved TikTok developer app and a user access token. Until then, paste numbers into data/manual.json.',
      provenance
    );
  }

  return safe('tiktok', provenance, async () => {
    const res = await getJson(
      'https://open.tiktokapis.com/v2/user/info/?fields=display_name,follower_count,likes_count,video_count',
      { headers: { Authorization: 'Bearer ' + token } }
    );
    const u = res.data?.user;
    if (!u) throw new Error('TikTok returned no user object. The token may have expired.');

    return result<TikTokData>('ok', {
      displayName: u.display_name ?? 'TikTok',
      followers: Number(u.follower_count ?? 0),
      likes: Number(u.likes_count ?? 0),
      videoCount: Number(u.video_count ?? 0),
    }, provenance);
  });
}
