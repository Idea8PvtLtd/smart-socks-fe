import Papa from 'papaparse';

class CalmnessSubChartsPush {
  constructor({ pollMs = 1000, maxPoints = 0, dataType = 'PulseRateVariability' } = {}) {
    this.data = [];
    this.listeners = [];
    this.intervalId = null;
    this.currentWearerId = null;
    this.storageListener = null;
    this.pollMs = pollMs;      
    this.maxPoints = maxPoints; 
    this.dataType = dataType;   

    // Initialize with current selected wearer
    this.updateSelectedWearer();
    this.setupStorageListener();
  }

  // ====== Wearer selection ======
  getSelectedWearerId() {
    return localStorage.getItem('selectedWearerId') || '1'; // default '1'
  }

  getCSVPath() {
    const wearerId = this.getSelectedWearerId();
    // Return the correct path based on dataType
    return `./data/${this.dataType}/${wearerId}.csv`;
  }

  updateSelectedWearer() {
    const newWearerId = this.getSelectedWearerId();
    if (newWearerId !== this.currentWearerId) {
      this.currentWearerId = newWearerId;
      // reset cache and force a full reload on next tick
      this.data = [];
      this.updateData(true);
    }
  }

  setupStorageListener() {
    // Fires when *another tab* changes localStorage
    this.storageListener = (event) => {
      if (event.key === 'selectedWearerId') {
        this.updateSelectedWearer();
      }
    };
    window.addEventListener('storage', this.storageListener);
  }

  // ====== Helpers ======
  getLastTimestamp() {
    if (!this.data.length) return 0;
    return this.data[this.data.length - 1].time; // unix seconds
  }

  // Optional memory cap
  maybeTrim() {
    if (this.maxPoints > 0 && this.data.length > this.maxPoints) {
      this.data.splice(0, this.data.length - this.maxPoints);
    }
  }

  // ====== Data fetching & parsing ======
  async fetchCSVData() {
    try {
      const csvPath = this.getCSVPath();
      // cache-bust to always get fresh content
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
              .filter(row => row.x && row.y && row.time && row.date)
              .map(row => {
                const dateTime = new Date(row.x); // 'YYYY-MM-DD HH:mm:SS+TZ'
                const unixTime = Math.floor(dateTime.getTime() / 1000);
                return {
                  time: unixTime,
                  value: parseFloat(row.y),
                  originalDateTime: row.x,
                  originalTime: row.time,
                  originalDate: row.date
                };
              })
              .filter(pt => Number.isFinite(pt.time) && Number.isFinite(pt.value))
              .sort((a, b) => a.time - b.time);

            // Return only new points beyond what we already have
            const delta = parsed.filter(pt => pt.time > lastSeen);
            resolve(delta);
          },
          error: (err) => reject(err),
        });
      });
    } catch (error) {
      console.error(`Error fetching CSV data for wearer ${this.currentWearerId}:`, error);
      return [];
    }
  }

  async updateData(forceFullReload = false) {
    const delta = await this.fetchCSVData();

    if (forceFullReload) {
      // If we just switched wearer, fetchCSVData() returns *all* rows.
      // Replace cache in that case.
      if (delta.length > 0) {
        this.data = delta;
        this.maybeTrim();
        this.notifyListeners();
      }
      return;
    }

    if (delta.length > 0) {
      // Append-only for live mode
      this.data = this.data.concat(delta);
      this.maybeTrim();
      this.notifyListeners();
    }
  }

  // ====== Pub/Sub ======
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(fn => fn !== callback);
  }

  notifyListeners() {
    for (const fn of this.listeners) {
      try { fn(this.data); } catch (e) { console.error('Listener error:', e); }
    }
  }

  // ====== Live control ======
  startLiveUpdates() {
    // Immediate load
    this.updateData(true);
    // Poll every second
    this.intervalId = setInterval(() => {
      // In same tab, detect wearer change
      this.updateSelectedWearer();
      // Then fetch the latest
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

// Create instances for each data type
export const pulseRateVariabilityChartPush = new CalmnessSubChartsPush({ 
  pollMs: 1000, 
  maxPoints: 10000, 
  dataType: 'PulseRateVariability' 
});

export const pulseRateChartPush = new CalmnessSubChartsPush({ 
  pollMs: 1000, 
  maxPoints: 10000, 
  dataType: 'PulseRate' 
});

export const skinConductanceChartPush = new CalmnessSubChartsPush({ 
  pollMs: 1000, 
  maxPoints: 10000, 
  dataType: 'SkinConductance' 
});

export const skinTemperatureChartPush = new CalmnessSubChartsPush({ 
  pollMs: 1000, 
  maxPoints: 10000, 
  dataType: 'SkinTemperature' 
});

// Default export for backward compatibility
export default pulseRateVariabilityChartPush;