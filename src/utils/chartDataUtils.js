export function normalizeChartPoints(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return [];
  }

  // Keep one point per timestamp (latest wins), then sort ascending.
  const byTime = new Map();
  for (const point of points) {
    const time = Number(point?.time);
    const value = Number(point?.value);
    if (!Number.isFinite(time) || !Number.isFinite(value)) {
      continue;
    }
    byTime.set(time, { ...point, time, value });
  }

  return Array.from(byTime.values()).sort((a, b) => a.time - b.time);
}
