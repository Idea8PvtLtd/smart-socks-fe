const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export async function fetchChartPoints(metric, wearerId, since = 0) {
  const params = new URLSearchParams();
  if (since > 0) {
    params.set('since', String(since));
  }

  const query = params.toString();
  const url = `${API_BASE}/api/charts/${metric}/${wearerId}${query ? `?${query}` : ''}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Chart fetch failed: HTTP ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload?.points) ? payload.points : [];
}
