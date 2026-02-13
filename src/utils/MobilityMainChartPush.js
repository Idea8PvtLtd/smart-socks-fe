import { fetchChartPoints } from './ChartApi';
import { normalizeChartPoints } from './chartDataUtils';

class MobilityMainChartPush {
  constructor({ pollMs = 1000, maxPoints = 0 } = {}) {
    this.metric = 'MobilityMainChart';
    this.data = [];
    this.listeners = [];
    this.intervalId = null;
    this.currentWearerId = null;
    this.storageListener = null;
    this.pollMs = pollMs;
    this.maxPoints = maxPoints;
    this.updateSelectedWearer();
    this.setupStorageListener();
  }

  getSelectedWearerId() {
    return localStorage.getItem('selectedWearerId') || '1';
  }

  updateSelectedWearer() {
    const newWearerId = this.getSelectedWearerId();
    if (newWearerId !== this.currentWearerId) {
      this.currentWearerId = newWearerId;
      this.data = [];
      this.updateData(true);
    }
  }

  setupStorageListener() {
    this.storageListener = (event) => {
      if (event.key === 'selectedWearerId') {
        this.updateSelectedWearer();
      }
    };
    window.addEventListener('storage', this.storageListener);
  }

  getLastTimestamp() {
    if (!this.data.length) return 0;
    return this.data[this.data.length - 1].time;
  }

  maybeTrim() {
    if (this.maxPoints > 0 && this.data.length > this.maxPoints) {
      this.data.splice(0, this.data.length - this.maxPoints);
    }
  }

  async fetchData() {
    try {
      return await fetchChartPoints(this.metric, this.getSelectedWearerId(), this.getLastTimestamp());
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error fetching ${this.metric}:`, error);
      return [];
    }
  }

  async updateData(forceFullReload = false) {
    const delta = forceFullReload
      ? await fetchChartPoints(this.metric, this.getSelectedWearerId(), 0).catch(() => [])
      : await this.fetchData();

    if (delta.length > 0) {
      this.data = normalizeChartPoints(forceFullReload ? delta : this.data.concat(delta));
      this.maybeTrim();
      this.notifyListeners();
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter((fn) => fn !== callback);
  }

  notifyListeners() {
    for (const fn of this.listeners) {
      try {
        fn(this.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Listener error:', error);
      }
    }
  }

  startLiveUpdates() {
    if (this.intervalId) {
      return;
    }

    this.updateData(true);
    this.intervalId = setInterval(() => {
      this.updateSelectedWearer();
      this.updateData();
    }, this.pollMs);
  }

  stopLiveUpdates() {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  switchWearer(wearerId) {
    localStorage.setItem('selectedWearerId', wearerId);
    this.updateSelectedWearer();
  }

  getCurrentData() {
    return normalizeChartPoints(this.data);
  }
}

const mobilityChartPush = new MobilityMainChartPush({ pollMs: 1000, maxPoints: 10000 });

export default mobilityChartPush;
