import chartSocketClient from './ChartSocketClient';
import { normalizeChartPoints } from './chartDataUtils';

class RealtimeChartPush {
  constructor({ metric, maxPoints = 0 } = {}) {
    this.metric = metric;
    this.maxPoints = maxPoints;
    this.data = [];
    this.listeners = [];
    this.currentWearerId = null;
    this.unsubscribeSocket = null;
    this.storageListener = null;
    this.activeConsumers = 0;
  }

  getSelectedWearerId() {
    return localStorage.getItem('selectedWearerId') || '1';
  }

  maybeTrim() {
    if (this.maxPoints > 0 && this.data.length > this.maxPoints) {
      this.data.splice(0, this.data.length - this.maxPoints);
    }
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

  subscribeSocket() {
    const wearerId = this.getSelectedWearerId();
    if (!wearerId) {
      return;
    }

    if (this.unsubscribeSocket) {
      this.unsubscribeSocket();
      this.unsubscribeSocket = null;
    }

    this.currentWearerId = wearerId;
    this.data = [];
    this.unsubscribeSocket = chartSocketClient.subscribe(this.metric, wearerId, (points) => {
      this.data = normalizeChartPoints(points);
      this.maybeTrim();
      this.notifyListeners();
    });
  }

  handleStorageChange = (event) => {
    if (event.key !== 'selectedWearerId') {
      return;
    }
    const wearerId = this.getSelectedWearerId();
    if (wearerId !== this.currentWearerId) {
      this.subscribeSocket();
    }
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
      return;
    }

    this.subscribeSocket();
    this.storageListener = this.handleStorageChange;
    window.addEventListener('storage', this.storageListener);
  }

  stopLiveUpdates() {
    this.activeConsumers = Math.max(0, this.activeConsumers - 1);
    if (this.activeConsumers > 0) {
      return;
    }

    if (this.unsubscribeSocket) {
      this.unsubscribeSocket();
      this.unsubscribeSocket = null;
    }

    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
  }

  switchWearer(wearerId) {
    localStorage.setItem('selectedWearerId', wearerId);
    if (wearerId !== this.currentWearerId) {
      this.subscribeSocket();
    }
  }

  getCurrentData() {
    return this.data;
  }
}

export default RealtimeChartPush;
