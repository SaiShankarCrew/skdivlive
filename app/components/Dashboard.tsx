'use client';

import { useEffect, useState } from 'react';
import type { Metrics } from '../../lib/types';
import Tiles from './Tiles';
import Funnel from './Funnel';
import PlatformCards from './PlatformCards';
import ClipChart from './ClipChart';

const POLL_MS = 60_000;

export default function Dashboard({ initial }: { initial: Metrics }) {
  const [metrics, setMetrics] = useState<Metrics>(initial);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [failing, setFailing] = useState(false);

  // Dates are formatted in the viewer's locale and timezone, which the server
  // cannot know. Render them only after mount so hydration never mismatches.
  useEffect(() => setLastCheck(new Date()), []);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch('/api/metrics', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const next: Metrics = await res.json();
        if (!cancelled) {
          setMetrics(next);
          setLastCheck(new Date());
          setFailing(false);
        }
      } catch {
        if (!cancelled) setFailing(true);
      }
    }

    const id = setInterval(tick, POLL_MS);
    // Refresh the moment someone comes back to the tab.
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const yt = metrics.youtube.data;
  const ig30 = metrics.instagram30Day.data;
  const igLive = metrics.instagram.data;

  const followers = igLive?.followers ?? null;
  const clips = (yt?.videos ?? []).filter(v => v.isShort).slice(0, 8);

  return (
    <>
      <div className="banner">
        {/* Drop your banner into public/banner.jpg */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/banner.jpg" alt="Skdiv.Studios" />
      </div>
      <div className="banner-rule" />

      <div className="wrap">
        <div className="toolbar">
          <div className="title-block">
            <div className="eyebrow">Skdiv.Studios &nbsp;/&nbsp; Show performance</div>
            <h1>CREWcasts <span className="light">Performance</span></h1>
          </div>
          <div className="toolbar-right">
            <span className="live">
              <span className={'pulse' + (failing ? ' stale' : '')} />
              {failing ? 'Reconnecting' : 'Live'}
            </span>
            <span className="stamp" suppressHydrationWarning>
              {lastCheck
                ? 'Checked ' + lastCheck.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
                : 'Starting'}
            </span>
          </div>
        </div>

        <Tiles metrics={metrics} />

        <section>
          <div className="sec-head">
            <h2>Reach to capture</h2>
            <span className="sec-note">Where the audience is lost</span>
          </div>
          <Funnel
            views={ig30?.views ?? null}
            viewers={ig30?.viewers ?? null}
            igFollowers={followers}
            ytSubscribers={yt?.subscribers ?? null}
          />
        </section>

        <section>
          <div className="sec-head">
            <h2>Platform coverage</h2>
            <span className="sec-note">What reports back, and what does not</span>
          </div>
          <PlatformCards metrics={metrics} />
          <div className="caveat">
            <b>Read these side by side, not added together.</b> Instagram figures cover a 30 day window.
            YouTube figures are lifetime totals. The two are never summed anywhere on this page, because
            a 30 day number and an all time number are different measurements.
          </div>
        </section>

        {clips.length > 0 && (
          <section>
            <div className="sec-head">
              <h2>YouTube clips</h2>
              <span className="sec-note">Lifetime views per clip</span>
            </div>
            <ClipChart clips={clips} />
          </section>
        )}

        <footer>
          <p>
            Every figure carries its own source. Numbers marked live come straight from the platform API on
            each refresh. Numbers marked entered by hand come from data/manual.json, because no API returns
            them. Nothing on this page is estimated.
          </p>
          <p className="stamp" suppressHydrationWarning>
            {lastCheck ? 'Data generated ' + new Date(metrics.generatedAt).toLocaleString('en-AU') : ''}
          </p>
          <div className="wordmark"><b>Skdiv<span className="pd">.</span></b>Studios</div>
        </footer>
      </div>
    </>
  );
}
