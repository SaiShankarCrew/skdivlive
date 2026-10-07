import type { Metrics } from '../../lib/types';

const fmt = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : Math.round(n).toLocaleString('en-AU');

export default function Tiles({ metrics }: { metrics: Metrics }) {
  const ig30 = metrics.instagram30Day.data;
  const igLive = metrics.instagram.data;
  const yt = metrics.youtube.data;

  const nonFollowerViews =
    ig30 ? (ig30.views * ig30.nonFollowerViewPct) / 100 : null;
  const reelViews = ig30 ? (ig30.views * ig30.reelsSharePct) / 100 : null;

  const tiles = [
    {
      label: 'Instagram views',
      value: fmt(igLive?.views ?? ig30?.views),
      sub: ig30 ? ig30.periodLabel : 'Last 30 days',
      lead: true,
    },
    {
      label: 'Unique viewers',
      value: fmt(ig30?.viewers),
      sub: ig30 ? (
        <>
          <span className="up">+{ig30.viewerGrowthPct.toLocaleString()}%</span> on the previous 30 days
        </>
      ) : 'Needs Instagram Insights',
    },
    {
      label: 'From non followers',
      value: ig30 ? ig30.nonFollowerViewPct + '%' : '—',
      sub: nonFollowerViews ? fmt(nonFollowerViews) + ' views from people who do not follow' : 'Not available yet',
    },
    {
      label: 'Reels share',
      value: ig30 ? ig30.reelsSharePct + '%' : '—',
      sub: reelViews ? fmt(reelViews) + ' views came from reels' : 'Not available yet',
    },
    {
      label: 'YouTube subscribers',
      value: fmt(yt?.subscribers),
      sub: yt ? fmt(yt.lifetimeViews) + ' lifetime views' : 'Add a YouTube API key',
    },
  ];

  return (
    <section>
      <div className="sec-head">
        <h2>Headline</h2>
        <span className="sec-note">Instagram leads, YouTube follows</span>
      </div>
      <div className="tiles">
        {tiles.map(t => (
          <div key={t.label} className={'tile' + (t.lead ? ' lead' : '')}>
            <div className="tile-label">{t.label}</div>
            <div className="tile-value">{t.value}</div>
            <div className="tile-sub">{t.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
