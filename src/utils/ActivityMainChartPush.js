import Papa from 'papaparse';

class ActivityMainChartPush {
    constructor() {
        this.data = [];
        this.listeners = [];
        this.intervalId = null;
        this.currentWearerId = null;
        this.storageListener = null;
        
        // Initialize with current selected wearer
        this.updateSelectedWearer();
        this.setupStorageListener();
    }

    getSelectedWearerId() {
        return localStorage.getItem('selectedWearerId') || '1'; // Default to '1' if not set
    }

    getCSVPath() {
        const wearerId = this.getSelectedWearerId();
        return `/src/ChartData/ActivityMainChart/${wearerId}.csv`;
    }

    updateSelectedWearer() {
        const newWearerId = this.getSelectedWearerId();
        if (newWearerId !== this.currentWearerId) {
            this.currentWearerId = newWearerId;
            // Clear current data and fetch new data for the selected wearer
            this.data = [];
            this.updateData();
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

    async fetchCSVData() {
        try {
            const csvPath = this.getCSVPath();
            const response = await fetch(csvPath);
            const csvText = await response.text();
            
            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const formattedData = results.data
                            .filter(row => row.x && row.y && row.time && row.date)
                            .map(row => {
                                // Convert the full datetime string to Unix timestamp
                                const dateTime = new Date(row.x);
                                const unixTime = Math.floor(dateTime.getTime() / 1000);
                                
                                return {
                                    time: unixTime,
                                    value: parseFloat(row.y),
                                    originalDateTime: row.x,
                                    originalTime: row.time,
                                    originalDate: row.date
                                };
                            })
                            .sort((a, b) => a.time - b.time); // Ensure ascending order
                        resolve(formattedData);
                    },
                    error: (error) => {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error(`Error fetching CSV data for wearer ${this.currentWearerId}:`, error);
            return [];
        }
    }

    async updateData() {
        const newData = await this.fetchCSVData();
        if (newData.length > 0) {
            this.data = newData;
            this.notifyListeners();
        }
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.data));
    }

    startLiveUpdates() {
        this.updateData();
        this.intervalId = setInterval(() => {
            // Check for user changes first (for same-tab changes)
            this.updateSelectedWearer();
            // Then update data
            this.updateData();
        }, 60000); // Update every minute
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

    // Method to manually switch wearer (useful for immediate updates)
    switchWearer(wearerId) {
        localStorage.setItem('selectedWearerId', wearerId);
        this.updateSelectedWearer();
    }

    getCurrentData() {
        return this.data;
    }
}

const activityChartPush = new ActivityMainChartPush();

export default activityChartPush;