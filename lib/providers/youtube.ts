import { YouTubeData, SourceResult, VideoItem } from '../types';
import { getJson, notConfigured, parseDuration, result, safe } from '../util';

const API = 'https://www.googleapis.com/youtube/v3';

export async function getYouTube(): Promise<SourceResult<YouTubeData>> {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const provenance = 'YouTube Data API v3, live';

  if (!key || !channelId) {
    return notConfigured<YouTubeData>(
      'Add YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID to switch this on.',
      provenance
    );
  }

  return safe('youtube', provenance, async () => {
    const ch = await getJson(
      API + '/channels?part=snippet,statistics,contentDetails&id=' + channelId + '&key=' + key
    );
    const channel = ch.items?.[0];
    if (!channel) throw new Error('Channel ' + channelId + ' not found.');

    const uploads = channel.contentDetails?.relatedPlaylists?.uploads;
    const videos: VideoItem[] = [];

    if (uploads) {
      // Walk up to 200 of the most recent uploads.
      let pageToken = '';
      const ids: string[] = [];
      for (let page = 0; page < 4; page++) {
        const list = await getJson(
          API + '/playlistItems?part=contentDetails&maxResults=50&playlistId=' + uploads +
          '&key=' + key + (pageToken ? '&pageToken=' + pageToken : '')
        );
        for (const it of list.items || []) {
          if (it.contentDetails?.videoId) ids.push(it.contentDetails.videoId);
        }
        pageToken = list.nextPageToken || '';
        if (!pageToken) break;
      }

      // videos.list takes 50 ids per call.
      for (let i = 0; i < ids.length; i += 50) {
        const batch = ids.slice(i, i + 50).join(',');
        const det = await getJson(
          API + '/videos?part=snippet,statistics,contentDetails&id=' + batch + '&key=' + key
        );
        for (const v of det.items || []) {
          const seconds = parseDuration(v.contentDetails?.duration || 'PT0S');
          videos.push({
            id: v.id,
            title: v.snippet?.title ?? 'Untitled',
            publishedAt: v.snippet?.publishedAt ?? '',
            views: Number(v.statistics?.viewCount ?? 0),
            likes: Number(v.statistics?.likeCount ?? 0),
            comments: Number(v.statistics?.commentCount ?? 0),
            durationSeconds: seconds,
            isShort: seconds > 0 && seconds <= 180,
            url: 'https://www.youtube.com/watch?v=' + v.id,
          });
        }
      }
    }

    videos.sort((a, b) => b.views - a.views);

    return result<YouTubeData>('ok', {
      channelTitle: channel.snippet?.title ?? 'YouTube',
      subscribers: Number(channel.statistics?.subscriberCount ?? 0),
      lifetimeViews: Number(channel.statistics?.viewCount ?? 0),
      videoCount: Number(channel.statistics?.videoCount ?? 0),
      videos,
    }, provenance);
  });
}
