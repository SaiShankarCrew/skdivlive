import { AppleData, SourceResult } from '../types';
import { getJson, notConfigured, result, safe } from '../util';
import manual from '../../data/manual.json';

/**
 * The public iTunes lookup endpoint needs no key and returns show metadata.
 * Play counts are Apple Podcasts Connect only, so the rating is carried in
 * data/manual.json and clearly labelled as hand entered.
 */
export async function getApple(): Promise<SourceResult<AppleData>> {
  const id = process.env.APPLE_PODCAST_ID;
  const provenance = 'Apple iTunes lookup, public metadata';

  if (!id) {
    return notConfigured<AppleData>('Add APPLE_PODCAST_ID.', provenance);
  }

  return safe('apple', provenance, async () => {
    const res = await getJson('https://itunes.apple.com/lookup?id=' + id + '&country=AU');
    const show = res.results?.[0];
    if (!show) throw new Error('Podcast ' + id + ' not found in the Apple directory.');

    const m: any = manual;
    return result<AppleData>('ok', {
      name: show.collectionName,
      episodeCount: Number(show.trackCount ?? 0),
      feedUrl: show.feedUrl ?? null,
      rating: m.apple?.enabled ? m.apple.rating : null,
      ratingCount: m.apple?.enabled ? m.apple.ratingCount : null,
    }, provenance);
  });
}
