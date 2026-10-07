export type SourceStatus = 'ok' | 'not_configured' | 'error' | 'manual';

export interface SourceResult<T> {
  status: SourceStatus;
  /** Present when status is 'ok' or 'manual'. */
  data: T | null;
  /** Human readable reason, shown on the dashboard when something is off. */
  message?: string;
  /** ISO timestamp of when this was fetched. */
  fetchedAt: string;
  /** Where the numbers came from, shown in the UI so nothing is mistaken for live. */
  provenance: string;
}

export interface VideoItem {
  id: string;
  title: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  durationSeconds: number;
  isShort: boolean;
  url: string;
}

export interface YouTubeData {
  channelTitle: string;
  subscribers: number;
  lifetimeViews: number;
  videoCount: number;
  videos: VideoItem[];
}

export interface InstagramData {
  username: string;
  followers: number;
  mediaCount: number;
  periodLabel: string;
  views: number | null;
  reach: number | null;
  interactions: number | null;
  topMedia: {
    id: string;
    caption: string;
    permalink: string;
    timestamp: string;
    likes: number;
    comments: number;
    views: number | null;
  }[];
}

export interface TikTokData {
  displayName: string;
  followers: number;
  likes: number;
  videoCount: number;
}

export interface SpotifyData {
  name: string;
  publisher: string;
  totalEpisodes: number;
  episodes: { name: string; releaseDate: string; durationMs: number; url: string }[];
}

export interface AppleData {
  name: string;
  episodeCount: number;
  feedUrl: string | null;
  rating: number | null;
  ratingCount: number | null;
}

export interface Metrics {
  generatedAt: string;
  youtube: SourceResult<YouTubeData>;
  instagram: SourceResult<InstagramData>;
  instagram30Day: SourceResult<{
    periodLabel: string;
    views: number;
    viewers: number;
    viewerGrowthPct: number;
    followerViewPct: number;
    nonFollowerViewPct: number;
    reelsSharePct: number;
  }>;
  tiktok: SourceResult<TikTokData>;
  spotify: SourceResult<SpotifyData>;
  apple: SourceResult<AppleData>;
}
