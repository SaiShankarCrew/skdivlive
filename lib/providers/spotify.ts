import { SourceResult, SpotifyData } from '../types';
import { getJson, notConfigured, result, safe } from '../util';

/**
 * Spotify's Web API returns show and episode metadata. It does NOT return play
 * counts for podcasts, for anybody, at any tier. Those live only in Spotify for
 * Creators and have to be entered by hand.
 */
export async function getSpotify(): Promise<SourceResult<SpotifyData>> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const showId = process.env.SPOTIFY_SHOW_ID;
  const provenance = 'Spotify Web API, metadata only';

  if (!clientId || !clientSecret || !showId) {
    return notConfigured<SpotifyData>(
      'Add SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_SHOW_ID for the episode list. Play counts are never available.',
      provenance
    );
  }

  return safe('spotify', provenance, async () => {
    const auth = Buffer.from(clientId + ':' + clientSecret).toString('base64');
    const tokenRes = await getJson('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const show = await getJson(
      'https://api.spotify.com/v1/shows/' + showId + '?market=AU',
      { headers: { Authorization: 'Bearer ' + tokenRes.access_token } }
    );

    return result<SpotifyData>('ok', {
      name: show.name,
      publisher: show.publisher,
      totalEpisodes: Number(show.total_episodes ?? 0),
      episodes: (show.episodes?.items || []).slice(0, 12).map((e: any) => ({
        name: e.name,
        releaseDate: e.release_date,
        durationMs: e.duration_ms,
        url: e.external_urls?.spotify ?? '',
      })),
    }, provenance);
  });
}
