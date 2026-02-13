import { normalizeChartPoints } from './chartDataUtils';

const stateByStream = new Map();

function streamKey(metric, wearerId) {
  return `${metric}::${wearerId}`;
}

function hashSeed(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function mulberry32(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function metricProfile(metric) {
  const key = metric.toLowerCase();
  const profiles = {
    activitymainchart: { min: 0, max: 1, start: 0.5, drift: 0.04, decimals: 8 },
    calmnessmainchart: { min: 0, max: 1, start: 0.5, drift: 0.04, decimals: 8 },
    mobilitymainchart: { min: 0, max: 1, start: 0.35, drift: 0.04, decimals: 8 },
    pulseratevariability: { min: 5, max: 100, start: 40, drift: 2.2, decimals: 3 },
    pulserate: { min: 50, max: 120, start: 75, drift: 1.8, decimals: 3 },
    skinconductance: { min: 0, max: 0.08, start: 0.025, drift: 0.003, decimals: 6 },
    skintemperature: { min: 32.12, max: 32.22, start: 32.17, drift: 0.003, decimals: 3 },
    steptimevariation: { min: 0.4, max: 0.8, start: 0.56, drift: 0.01, decimals: 4 },
    turns: { min: 1.4, max: 2.2, start: 1.8, drift: 0.03, decimals: 2 },
    symmetryproxy: { min: 0.885, max: 0.915, start: 0.9, drift: 0.002, decimals: 3 },
    cadence: { min: 35, max: 80, start: 52, drift: 1.2, decimals: 3 },
    walking: { min: 0.8, max: 1.8, start: 1.2, drift: 0.03, decimals: 3 },
    steps: { min: 0, max: 4, start: 0, drift: 1.2, decimals: 0 },
    bouts: { min: 0, max: 6, start: 1, drift: 1.1, decimals: 0 },
    longestbout: { min: 2, max: 300, start: 40, drift: 9, decimals: 0 },
  };
  return profiles[key] ?? { min: 0, max: 1, start: 0.5, drift: 0.04, decimals: 4 };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatValue(value, decimals) {
  if (decimals <= 0) {
    return Math.round(value);
  }
  return Number(value.toFixed(decimals));
}

function buildPoint(time, value) {
  const date = new Date(time * 1000);
  const iso = date.toISOString();
  return {
    time,
    value,
    originalDateTime: iso,
    originalTime: iso.slice(11, 19),
    originalDate: iso.slice(0, 10),
  };
}

function ensureStream(metric, wearerId) {
  const key = streamKey(metric, wearerId);
  const existing = stateByStream.get(key);
  if (existing) {
    return existing;
  }

  const seed = hashSeed(key);
  const random = mulberry32(seed);
  const profile = metricProfile(metric);
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - 300;
  const points = [];
  let value = profile.start + (random() - 0.5) * profile.drift * 5;

  for (let t = startTime; t <= now; t += 1) {
    value = clamp(value + (random() - 0.5) * profile.drift, profile.min, profile.max);
    points.push(buildPoint(t, formatValue(value, profile.decimals)));
  }

  const stream = {
    metric,
    wearerId,
    random,
    profile,
    points: normalizeChartPoints(points),
    timer: null,
    refs: 0,
  };
  stateByStream.set(key, stream);
  return stream;
}

function tickStream(stream) {
  const lastTime = stream.points.length > 0 ? stream.points[stream.points.length - 1].time : Math.floor(Date.now() / 1000);
  const time = Math.max(Math.floor(Date.now() / 1000), lastTime + 1);
  const lastValue = stream.points.length > 0 ? stream.points[stream.points.length - 1].value : stream.profile.start;
  const next = clamp(lastValue + (stream.random() - 0.5) * stream.profile.drift, stream.profile.min, stream.profile.max);
  stream.points.push(buildPoint(time, formatValue(next, stream.profile.decimals)));
  if (stream.points.length > 10000) {
    stream.points.splice(0, stream.points.length - 10000);
  }
}

class RealtimeChartPush {
  constructor({ metric, maxPoints = 0 } = {}) {
    this.metric = metric;
    this.maxPoints = maxPoints;
    this.listeners = [];
    this.currentWearerId = null;
    this.storageListener = null;
    this.unsubscribeTick = null;
    this.activeConsumers = 0;
  }

  getSelectedWearerId() {
    return localStorage.getItem('selectedWearerId') || '1';
  }

  getActiveStream() {
    const wearerId = this.currentWearerId ?? this.getSelectedWearerId();
    return ensureStream(this.metric, wearerId);
  }

  getCurrentData() {
    const points = this.getActiveStream().points;
    return this.maxPoints > 0 ? points.slice(-this.maxPoints) : points;
  }

  notifyListeners() {
    const data = this.getCurrentData();
    for (const fn of this.listeners) {
      try {
        fn(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Listener error:', error);
      }
    }
  }

  attachStream() {
    const wearerId = this.getSelectedWearerId();
    if (!wearerId) {
      return;
    }

    if (wearerId !== this.currentWearerId && this.unsubscribeTick) {
      this.unsubscribeTick();
      this.unsubscribeTick = null;
    }

    this.currentWearerId = wearerId;
    const stream = ensureStream(this.metric, wearerId);

    if (!this.unsubscribeTick) {
      stream.refs += 1;
      if (!stream.timer) {
        stream.timer = setInterval(() => tickStream(stream), 1000);
      }

      const listener = () => this.notifyListeners();
      const localTimer = setInterval(listener, 1000);
      listener();

      this.unsubscribeTick = () => {
        clearInterval(localTimer);
        stream.refs = Math.max(0, stream.refs - 1);
        if (stream.refs === 0 && stream.timer) {
          clearInterval(stream.timer);
          stream.timer = null;
        }
      };
    } else {
      this.notifyListeners();
    }
  }

  handleStorageChange = (event) => {
    if (event.key !== 'selectedWearerId') {
      return;
    }
    this.attachStream();
  };

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter((fn) => fn !== callback);
  }

  startLiveUpdates() {
    this.activeConsumers += 1;
    if (this.activeConsumers > 1) {
      this.notifyListeners();
      return;
    }

    if (!this.storageListener) {
      this.storageListener = this.handleStorageChange;
      window.addEventListener('storage', this.storageListener);
    }
    this.attachStream();
  }

  stopLiveUpdates() {
    this.activeConsumers = Math.max(0, this.activeConsumers - 1);
    if (this.activeConsumers > 0) {
      return;
    }

    if (this.unsubscribeTick) {
      this.unsubscribeTick();
      this.unsubscribeTick = null;
    }
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
  }

  switchWearer(wearerId) {
    localStorage.setItem('selectedWearerId', wearerId);
    this.attachStream();
  }
}

export default RealtimeChartPush;
