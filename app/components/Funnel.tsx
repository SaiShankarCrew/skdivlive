const fmt = (n: number) => Math.round(n).toLocaleString('en-AU');

interface Props {
  views: number | null;
  viewers: number | null;
  igFollowers: number | null;
  ytSubscribers: number | null;
}

export default function Funnel({ views, viewers, igFollowers, ytSubscribers }: Props) {
  const stages = [
    { name: 'Instagram views', sub: 'Last 30 days', value: views },
    { name: 'Unique viewers', sub: 'Real people reached', value: viewers },
    { name: 'Instagram followers', sub: 'Total, all time', value: igFollowers, dim: true },
    { name: 'YouTube subscribers', sub: 'Total, all time', value: ytSubscribers, dim: true },
  ];

  const max = stages.reduce((m, s) => Math.max(m, s.value ?? 0), 0) || 1;

  return (
    <div className="funnel">
      {stages.map((s, i) => (
        <div className="stage-row" key={s.name}>
          <div className="stage-name">
            <b>{s.name}</b>
            <span>{s.sub}</span>
          </div>
          <div className="stage-bar">
            <div className="stage-track">
              <div
                className={'stage-fill' + (s.dim ? ' dim' : '')}
                style={{ width: ((s.value ?? 0) / max) * 100 + '%' }}
              />
            </div>
            <div className="stage-num">
              {s.value === null ? '—' : fmt(s.value)}{' '}
              <em>
                {i >= 2 && s.value !== null && viewers
                  ? ((s.value / viewers) * 100).toFixed(2) + '% of viewers'
                  : ''}
              </em>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
