import { io } from 'socket.io-client';
import { mergeChartPoints, normalizeChartPoints } from './chartDataUtils';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

function resolveSocketUrl() {
  return API_BASE;
}

class ChartSocketClient {
  constructor() {
    this.socket = io(resolveSocketUrl(), {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    this.streams = new Map();

    this.socket.on('connect', () => {
      for (const stream of this.streams.values()) {
        const since = stream.points.length > 0 ? stream.points[stream.points.length - 1].time : 0;
        this.socket.emit('charts:subscribe', {
          metric: stream.metric,
          wearerId: stream.wearerId,
          since,
        });
      }
    });

    this.socket.on('charts:init', (payload) => this.applySnapshot(payload));
    this.socket.on('charts:update', (payload) => this.applyDelta(payload));
  }

  streamKey(metric, wearerId) {
    return `${metric}::${wearerId}`;
  }

  applySnapshot(payload) {
    const metric = `${payload?.metric ?? ''}`;
    const wearerId = `${payload?.wearerId ?? ''}`;
    const key = this.streamKey(metric, wearerId);
    const stream = this.streams.get(key);
    if (!stream) {
      return;
    }

    stream.points = normalizeChartPoints(payload?.points);
    stream.listeners.forEach((listener) => listener(stream.points));
  }

  applyDelta(payload) {
    const metric = `${payload?.metric ?? ''}`;
    const wearerId = `${payload?.wearerId ?? ''}`;
    const key = this.streamKey(metric, wearerId);
    const stream = this.streams.get(key);
    if (!stream) {
      return;
    }

    stream.points = mergeChartPoints(stream.points, payload?.points);
    stream.listeners.forEach((listener) => listener(stream.points));
  }

  subscribe(metric, wearerId, listener) {
    const key = this.streamKey(metric, wearerId);
    let stream = this.streams.get(key);

    if (!stream) {
      stream = {
        metric,
        wearerId,
        points: [],
        listeners: new Set(),
      };
      this.streams.set(key, stream);
      this.socket.emit('charts:subscribe', { metric, wearerId, since: 0 });
    }

    stream.listeners.add(listener);
    if (stream.points.length > 0) {
      listener(stream.points);
    }

    return () => {
      const current = this.streams.get(key);
      if (!current) {
        return;
      }
      current.listeners.delete(listener);
      if (current.listeners.size === 0) {
        this.socket.emit('charts:unsubscribe', { metric, wearerId });
        this.streams.delete(key);
      }
    };
  }
}

const chartSocketClient = new ChartSocketClient();

export default chartSocketClient;
