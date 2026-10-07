import type { VideoItem } from '../../lib/types';

const fmt = (n: number) => n.toLocaleString('en-AU');

export default function ClipChart({ clips }: { clips: VideoItem[] }) {
  const max = clips.reduce((m, c) => Math.max(m, c.views), 0) || 1;

  return (
    <div className="panel">
      <div className="chart">
        {clips.map((c, i) => (
          <div className={'bar-row' + (i === 0 ? ' top' : '')} key={c.id} title={c.title}>
            <div className="bar-label">{c.title}</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: (c.views / max) * 100 + '%' }} />
            </div>
            <div className="bar-val">{fmt(c.views)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
