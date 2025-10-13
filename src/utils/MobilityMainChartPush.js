import Papa from 'papaparse';

class MobilityMainChartPush {
  constructor({ pollMs = 1000, maxPoints = 0 } = {}) {
    this.data = [];
    this.listeners = [];
    this.intervalId = null;
    this.currentWearerId = null;
    this.storageListener = null;
    this.pollMs = pollMs;       // 1s polling
    this.maxPoints = maxPoints; // 0 = unlimited

    // Initialize with current selected wearer
    this.updateSelectedWearer();
    this.setupStorageListener();
  }

  // ===== Wearer selection =====
  getSelectedWearerId() {
    return localStorage.getItem('selectedWearerId') || '1';
  }

  getCSVPath() {
    const wearerId = this.getSelectedWearerId();
    return `./data/MobilityMainChart/${wearerId}.csv`;
  }

  updateSelectedWearer() {
    const newWearerId = this.getSelectedWearerId();
    if (newWearerId !== this.currentWearerId) {
      this.currentWearerId = newWearerId;
      this.data = [];            // reset cache
      this.updateData(true);     // full reload on switch
    }
  }

  setupStorageListener() {
    this.storageListener = (event) => {
      if (event.key === 'selectedWearerId') this.updateSelectedWearer();
    };
    window.addEventListener('storage', this.storageListener);
  }

  // ===== Helpers =====
  getLastTimestamp() {
    if (!this.data.length) return 0;
    return this.data[this.data.length - 1].time; // unix seconds
  }

  maybeTrim() {
    if (this.maxPoints > 0 && this.data.length > this.maxPoints) {
      this.data.splice(0, this.data.length - this.maxPoints);
    }
  }

  // ===== Fetch & parse CSV =====
  async fetchCSVData() {
    try {
      const csvPath = this.getCSVPath();
      const response = await fetch(`${csvPath}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const csvText = await response.text();

      const lastSeen = this.getLastTimestamp();

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data
              .filter(r => r.x && r.y && r.time && r.date)
              .map(r => {
                const dt = new Date(r.x);
                const unixTime = Math.floor(dt.getTime() / 1000);
                return {
                  time: unixTime,
                  value: parseFloat(r.y),
                  originalDateTime: r.x,
                  originalTime: r.time,
                  originalDate: r.date
                };
              })
              .filter(pt => Number.isFinite(pt.time) && Number.isFinite(pt.value))
              .sort((a, b) => a.time - b.time);

            // Only new points beyond what we already have
            const delta = parsed.filter(pt => pt.time > lastSeen);
            resolve(delta);
          },
          error: reject
        });
      });
    } catch (err) {
      console.error(`Error fetching CSV data for wearer ${this.currentWearerId}:`, err);
      return [];
    }
  }

  async updateData(forceFullReload = false) {
    const delta = await this.fetchCSVData();

    if (forceFullReload) {
      if (delta.length > 0) {
        this.data = delta;       // replace on wearer switch
        this.maybeTrim();
        this.notifyListeners();
      }
      return;
    }

    if (delta.length > 0) {
      this.data = this.data.concat(delta); // append-only
      this.maybeTrim();
      this.notifyListeners();
    }
  }

  // ===== Pub/Sub =====
  addListener(cb) { this.listeners.push(cb); }

  removeListener(cb) { this.listeners = this.listeners.filter(fn => fn !== cb); }

  notifyListeners() {
    for (const fn of this.listeners) {
      try { fn(this.data); } catch (e) { console.error('Listener error:', e); }
    }
  }

  // ===== Live control =====
  startLiveUpdates() {
    this.updateData(true); // initial full load
    this.intervalId = setInterval(() => {
      this.updateSelectedWearer();
      this.updateData();
    }, this.pollMs);
  }

  stopLiveUpdates() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
  }

  // Manual switch for immediate updates
  switchWearer(wearerId) {
    localStorage.setItem('selectedWearerId', wearerId);
    this.updateSelectedWearer();
  }

  getCurrentData() {
    return this.data;
  }
}

// Example: 1s polling, keep last 10k points
const mobilityChartPush = new MobilityMainChartPush({ pollMs: 1000, maxPoints: 10000 });

export default mobilityChartPush;
