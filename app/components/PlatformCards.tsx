import type { Metrics, SourceResult } from '../../lib/types';

const fmt = (n: number) => Math.round(n).toLocaleString('en-AU');

const LABEL: Record<string, string> = {
  ok: 'Live',
  manual: 'By hand',
  not_configured: 'Not configured',
  error: 'Error',
};

function Card({
  name,
  source,
  value,
  note,
  hero,
}: {
  name: string;
  source: SourceResult<any>;
  value: string;
  note: string;
  hero?: boolean;
}) {
  const dim = source.status !== 'ok' && source.status !== 'manual';
  return (
    <div className={'pcard' + (hero ? ' hero' : '')}>
      <div className="pcard-top">
        <span className="pcard-name">{name}</span>
        <span className={'status ' + source.status}>{LABEL[source.status]}</span>
      </div>
      <div className={'pcard-value' + (dim ? ' dim' : '')}>{value}</div>
      <div className="pcard-note">{source.message ?? note}</div>
      <div className="pcard-src">{source.provenance}</div>
    </div>
  );
}

export default function PlatformCards({ metrics }: { metrics: Metrics }) {
  const { youtube, instagram, instagram30Day, tiktok, spotify, apple } = metrics;
  const ig = instagram.data;
  const ig30 = instagram30Day.data;
  const yt = youtube.data;

  return (
    <div className="cards">
      <Card
        hero
        name="Instagram"
        source={instagram.status === 'ok' ? instagram : instagram30Day}
        value={ig?.views ? fmt(ig.views) + ' views' : ig30 ? fmt(ig30.views) + ' views' : 'Not connected'}
        note={ig ? fmt(ig.followers) + ' followers, ' + fmt(ig.mediaCount) + ' posts' : 'Awaiting Graph API access'}
      />
      <Card
        name="YouTube"
        source={youtube}
        value={yt ? fmt(yt.lifetimeViews) + ' views' : 'Not connected'}
        note={yt ? fmt(yt.subscribers) + ' subscribers, ' + fmt(yt.videoCount) + ' uploads' : 'Add an API key'}
      />
      <Card
        name="TikTok"
        source={tiktok}
        value={tiktok.data ? fmt(tiktok.data.followers) + ' followers' : 'Not connected'}
        note="Needs an approved developer app"
      />
      <Card
        name="Spotify"
        source={spotify}
        value={spotify.data ? spotify.data.totalEpisodes + ' episodes' : 'Not connected'}
        note="Play counts are never exposed by any podcast API"
      />
      <Card
        name="Apple Podcasts"
        source={apple}
        value={apple.data ? apple.data.episodeCount + ' episodes' : 'Not connected'}
        note={
          apple.data?.rating
            ? `★ ${apple.data.rating.toFixed(1)} rating (${apple.data.ratingCount} ${apple.data.ratingCount === 1 ? 'review' : 'reviews'})`
            : 'Public directory metadata'
        }
      />
    </div>
  );
}
