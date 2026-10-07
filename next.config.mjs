/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow skdiv-website (on Hostinger or any domain) to call /api/metrics
  // cross-origin from the browser. Without this header the browser blocks
  // the fetch and the /skdivlive page shows "Reconnecting…" forever.
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;

