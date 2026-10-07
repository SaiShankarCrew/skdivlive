import Dashboard from './components/Dashboard';
import { getMetrics } from '../lib/aggregate';

// The shell renders on the server with fresh numbers, then the client keeps
// polling /api/metrics so the page updates while it sits open.
export const revalidate = 300;

export default async function Page() {
  const initial = await getMetrics();
  return <Dashboard initial={initial} />;
}
