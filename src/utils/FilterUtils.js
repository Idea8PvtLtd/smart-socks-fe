/**
 * Filters data based on the specified date range.
 * @param {Array} data - The data to filter.
 * @param {string} startDate - The start date in ISO format.
 * @param {string} periodUnit - The period unit ('day', 'week', 'month').
 * @returns {Array} - The filtered data.
 */
export function filterDataByDateRange(data, startDate, periodUnit) {
    if (!startDate || !data || data.length === 0) return data;

    const start = new Date(startDate);
    const end = new Date(start);

    switch (periodUnit) {
        case "day":
            end.setDate(end.getDate() + 1);
            break;
        case "week":
            end.setDate(end.getDate() + 7);
            break;
        case "month":
            end.setMonth(end.getMonth() + 1);
            break;
        default:
            return data;
    }

    return data.filter((point) => {
        const pointDate = new Date(point.time * 1000);
        return pointDate >= start && pointDate < end;
    });
}

export const DATA_BASE_DIR = '/data'; // Base directory for data files