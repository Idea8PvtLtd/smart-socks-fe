import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { pulseRateVariabilityChartPush, pulseRateChartPush, skinConductanceChartPush, skinTemperatureChartPush } from '../../../../utils/CalmnessSubChartsPush';
import { stepTimeVariationChartPush, turnsChartPush, symmetryProxyChartPush, cadenceChartPush } from '../../../../utils/MobilitySubChartsPush';
import { walkingChartPush, stepsChartPush, boutsChartPush, longestBoutChartPush } from '../../../../utils/ActivitySubChartsPush';

// Data source mapping
const DATA_SOURCES = {
    Steps: stepsChartPush,
    Bouts: boutsChartPush,
    Longest: longestBoutChartPush,
    Walking: walkingChartPush,
    Heart: pulseRateVariabilityChartPush,
    Pulse: pulseRateChartPush,
    Skin: skinConductanceChartPush,
    SkinTemperature: skinTemperatureChartPush,
    Cadence: cadenceChartPush,
    StepTiming: stepTimeVariationChartPush,
    SymmetryProxy: symmetryProxyChartPush,
    Turns: turnsChartPush,
    Stride: stepTimeVariationChartPush
};

const SERIES_CONFIG = [
    { id: "toggleSteps", key: "Steps Chart", color: "#0077B6", dataKey: "Steps" },
    { id: "toggleBouts", key: "Bouts Chart", color: "#6E9600", dataKey: "Bouts" },
    { id: "toggleLongest", key: "Longest Bout Chart", color: "#F50B5D", dataKey: "Longest" },
    { id: "toggleWalking", key: "Walking Chart", color: "#FF0000", dataKey: "Walking" },
    { id: "toggleHeart", key: "Pulserate variability", color: "#000000", dataKey: "Heart" },
    { id: "togglePulse", key: "Pulse rate", color: "#673A8F", dataKey: "Pulse" },
    { id: "toggleSkin", key: "Skin conductance", color: "#44B649", dataKey: "Skin" },
    { id: "toggleSkinTemperature", key: "Skin Temperature", color: "#FF6600", dataKey: "SkinTemperature" },
    { id: "toggleCadence", key: "Cadence Chart", color: "#FF00C8", dataKey: "Cadence" },
    { id: "toggleStepTiming", key: "Step Timing Variation", color: "#FF6600", dataKey: "StepTiming" },
    { id: "toggleSymmetryProxy", key: "Symmetry Proxy Chart", color: "#00A661", dataKey: "SymmetryProxy" },
    { id: "toggleTurns", key: "Turns Chart", color: "#EF4444", dataKey: "Turns" },
    { id: "toggleStride", key: "Stride Time Chart", color: "#0B3EF5", dataKey: "Stride" },
];

// Database Helper Functions
const DB_KEY = 'compareChart';

const getDatabase = () => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : {};
};

const saveDatabase = (db) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const getAnnotations = (chartName, userId, chartType) => {
    const db = getDatabase();
    if (!chartName || !userId) return [];

    const chartData = db[chartName];
    if (!chartData) return [];

    const userData = chartData[userId];
    if (!userData) return [];

    const annotations = [];
    Object.keys(userData).forEach(key => {
        if (key.startsWith('Note')) {
            const note = userData[key];
            if (!chartType || note.chartType === chartType) {
                annotations.push(note);
            }
        }
    });

    return annotations;
};

const addAnnotation = (chartName, userId, chartType, annotation) => {
    if (!chartName || !userId) return;

    const db = getDatabase();

    if (!db[chartName]) db[chartName] = {};
    if (!db[chartName][userId]) db[chartName][userId] = {};

    const existingNotes = Object.keys(db[chartName][userId]).filter(k => k.startsWith('Note'));
    const nextNumber = existingNotes.length + 1;
    const noteKey = `Note${nextNumber}`;

    db[chartName][userId][noteKey] = {
        ...annotation,
        chartName,
        chartType,
        timestamp: new Date().toISOString()
    };

    saveDatabase(db);
};

const deleteAnnotation = (chartName, userId, annotation) => {
    if (!chartName || !userId) return;

    const db = getDatabase();

    if (!db[chartName] || !db[chartName][userId]) return;

    Object.keys(db[chartName][userId]).forEach(key => {
        if (key.startsWith('Note')) {
            const note = db[chartName][userId][key];
            if (note.timestamp === annotation.timestamp &&
                note.x === annotation.x &&
                note.y === annotation.y) {
                delete db[chartName][userId][key];
            }
        }
    });

    saveDatabase(db);
};

// Helper Functions
function padRange(arr, pct = 0.12) {
    const lo = Math.min(...arr), hi = Math.max(...arr);
    const pad = (hi - lo || Math.abs(lo) || 1) * pct;
    return [lo - pad, hi + pad];
}

function makeLanesTransformed(X, seriesDefs) {
    const N = seriesDefs.length;
    const yGlobalMin = 0;
    const yGlobalMax = N;

    const laneMeta = [];
    const transformedSeries = seriesDefs.map((s, i) => {
        const [lo, hi] = padRange(s.data);
        const laneGap = 0.1;
        const laneBottom = i + laneGap;
        const laneTop = i + 1 - laneGap;

        const scale = (val) => laneBottom + ((val - lo) / (hi - lo)) * (laneTop - laneBottom);

        laneMeta.push({ key: s.key, color: s.color, lo, hi, laneBottom, laneTop });
        return s.data.map(scale);
    });

    return {
        data: [X, ...transformedSeries],
        laneMeta,
        yRange: [yGlobalMin, yGlobalMax],
    };
}

// Date filtering function
function filterDataByDateRange(data, startDate, periodUnit) {
    if (!startDate || !data || data.length === 0) return data;

    const start = new Date(startDate);
    let end = new Date(start);

    switch (periodUnit) {
        case 'day':
            end.setDate(end.getDate() + 1);
            break;
        case 'week':
            end.setDate(end.getDate() + 7);
            break;
        case 'month':
            end.setMonth(end.getMonth() + 1);
            break;
        case 'year':
            end.setFullYear(end.getFullYear() + 1);
            break;
        default:
            end.setDate(end.getDate() + 1);
    }

    return data.filter(point => {
        const pointDate = new Date(point.time * 1000);
        return pointDate >= start && pointDate < end;
    });
}

function CompareChartComponents({ toggles, chartType = 'default', periodUnit = 'day', startDate = '', chartName = '' }) {
    const chartRef = useRef(null);
    const plotInstance = useRef(null);
    const [liveData, setLiveData] = useState({});

    const [allAnnotations, setAllAnnotations] = useState(() => {
        const selectedWearerId = localStorage.getItem('selectedWearerId');
        if (!selectedWearerId) return {};

        const annotationsMap = {};
        SERIES_CONFIG.forEach(series => {
            const chartName = series.id.replace('toggle', '');
            annotationsMap[chartName] = getAnnotations(chartName, selectedWearerId, chartType);
        });
        return annotationsMap;
    });

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [currentNote, setCurrentNote] = useState("");
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    const [pendingAnnotation, setPendingAnnotation] = useState(null);
    const annotationHitboxes = useRef([]);
    const annotationTooltip = useRef(null);

    const activeSeries = SERIES_CONFIG.filter(series => toggles[series.id]);

    // Fetch live data
    useEffect(() => {
        const updateChartData = () => {
            const newData = {};

            SERIES_CONFIG.forEach(series => {
                const dataSource = DATA_SOURCES[series.dataKey];
                if (dataSource) {
                    let rawData = dataSource.getCurrentData();

                    // Apply date filtering
                    if (startDate && periodUnit) {
                        rawData = filterDataByDateRange(rawData, startDate, periodUnit);
                    }

                    newData[series.dataKey] = rawData;
                }
            });

            setLiveData(newData);
        };

        // Add listeners
        Object.values(DATA_SOURCES).forEach(source => {
            if (source && source.addListener) {
                source.addListener(updateChartData);
            }
        });

        // Start live updates
        Object.values(DATA_SOURCES).forEach(source => {
            if (source && source.startLiveUpdates) {
                source.startLiveUpdates();
            }
        });

        updateChartData();

        return () => {
            Object.values(DATA_SOURCES).forEach(source => {
                if (source && source.removeListener) {
                    source.removeListener(updateChartData);
                }
                if (source && source.stopLiveUpdates) {
                    source.stopLiveUpdates();
                }
            });
        };
    }, [startDate, periodUnit]);

    useEffect(() => {
        if (!chartRef.current || activeSeries.length === 0) {
            if (plotInstance.current) {
                plotInstance.current.destroy();
                plotInstance.current = null;
            }
            return;
        }

        // Prepare data for active series
        const allTimestamps = new Set();
        activeSeries.forEach(series => {
            const data = liveData[series.dataKey] || [];
            data.forEach(point => allTimestamps.add(point.time));
        });

        const timestamps = Array.from(allTimestamps).sort((a, b) => a - b);

        if (timestamps.length === 0) return;

        const seriesWithData = activeSeries.map(series => {
            const dataMap = new Map((liveData[series.dataKey] || []).map(d => [d.time, d.value]));
            const values = timestamps.map(t => dataMap.get(t) ?? null);

            return {
                ...series,
                data: values
            };
        });

        const { data, laneMeta, yRange } = makeLanesTransformed(timestamps, seriesWithData);

        const tooltip = document.createElement("div");
        const annTooltip = document.createElement("div");

        Object.assign(tooltip.style, {
            position: "absolute",
            pointerEvents: "none",
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            padding: "6px 8px",
            borderRadius: "8px",
            fontSize: "12px",
            display: "none",
            zIndex: "10"
        });

        Object.assign(annTooltip.style, {
            position: "absolute",
            pointerEvents: "none",
            background: "#362b44",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            display: "none",
            zIndex: "15",
            maxWidth: "300px",
            wordWrap: "break-word",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            lineHeight: "1.4"
        });

        chartRef.current.appendChild(tooltip);
        chartRef.current.appendChild(annTooltip);
        annotationTooltip.current = annTooltip;

        const opts = {
            width: chartRef.current.clientWidth,
            height: activeSeries.length * 200,
            padding: [null, 16, null, 50],
            scales: { x: { time: false }, y: { range: yRange } },
            axes: [
                {
                    scale: "x",
                    grid: { show: true },
                    values: (u, vals) => vals.map(v => {
                        const date = new Date(v * 1000);
                        if (periodUnit === 'day') {
                            const hours = date.getHours().toString().padStart(2, '0');
                            const minutes = date.getMinutes().toString().padStart(2, '0');
                            return `${hours}:${minutes}`;
                        } else {
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            const day = date.getDate().toString().padStart(2, '0');
                            return `${month}/${day}`;
                        }
                    }),
                },
                {
                    scale: "y",
                    show: false,
                    grid: { show: false },
                },
            ],
            series: [
                {},
                ...seriesWithData.map((s) => ({
                    label: s.key,
                    stroke: s.color,
                    width: 2.5,
                    points: { show: true },
                })),
            ],
            cursor: { focus: { prox: 24 } },
            hooks: {
                draw: [
                    (u) => {
                        const { ctx } = u;
                        const padL = u.bbox.left;
                        const padR = u.bbox.left + u.bbox.width;

                        ctx.save();
                        ctx.textBaseline = "middle";

                        ctx.strokeStyle = "rgba(0,0,0,0.25)";
                        ctx.beginPath();
                        ctx.moveTo(padL, u.bbox.top);
                        ctx.lineTo(padL, u.bbox.top + u.bbox.height);
                        ctx.stroke();

                        const tickCount = 5;

                        laneMeta.forEach((m) => {
                            const yTopPx = u.valToPos(m.laneTop, "y", true);
                            const yBotPx = u.valToPos(m.laneBottom, "y", true);

                            ctx.strokeStyle = "rgba(0,0,0,0.10)";
                            ctx.beginPath();
                            ctx.moveTo(padL, yTopPx);
                            ctx.lineTo(padR, yTopPx);
                            ctx.stroke();

                            ctx.fillStyle = m.color;
                            ctx.font = "600 12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
                            ctx.textAlign = "right";
                            ctx.fillText(m.key, padR - 6, yTopPx + 14);

                            ctx.fillStyle = "#444";
                            ctx.font = "11px system-ui, -apple-system, Segoe UI, Roboto, Arial";
                            ctx.textAlign = "right";

                            for (let j = 0; j <= tickCount; j++) {
                                const frac = j / tickCount;
                                const val = m.lo + frac * (m.hi - m.lo);
                                const yValLane = m.laneBottom + frac * (m.laneTop - m.laneBottom);
                                const yPx = u.valToPos(yValLane, "y", true);

                                ctx.fillText(val.toFixed(3), padL - 6, yPx);

                                ctx.strokeStyle = "rgba(0,0,0,0.06)";
                                ctx.beginPath();
                                ctx.moveTo(padL, yPx);
                                ctx.lineTo(padR, yPx);
                                ctx.stroke();
                            }

                            if (m === laneMeta[laneMeta.length - 1]) {
                                ctx.strokeStyle = "rgba(0,0,0,0.10)";
                                ctx.beginPath();
                                ctx.moveTo(padL, yBotPx);
                                ctx.lineTo(padR, yBotPx);
                                ctx.stroke();
                            }
                        });

                        annotationHitboxes.current = [];

                        activeSeries.forEach((series, laneIndex) => {
                            const chartName = series.id.replace('toggle', '');
                            const annotations = allAnnotations[chartName] || [];

                            annotations.forEach((ann) => {
                                if (ann.chartName !== chartName) return;

                                const xPx = u.valToPos(ann.x, "x", true);
                                const storedLaneIndex = Math.floor(ann.y);
                                const fractionalY = ann.y - storedLaneIndex;
                                const newY = laneIndex + fractionalY;
                                const yPx = u.valToPos(newY, "y", true);

                                annotationHitboxes.current.push({
                                    xPx: xPx,
                                    yPx: yPx,
                                    radius: 10,
                                    annotation: ann,
                                    chartName: chartName
                                });

                                ctx.fillStyle = "#362b44";
                                ctx.beginPath();
                                ctx.arc(xPx, yPx, 6, 0, 2 * Math.PI);
                                ctx.fill();

                                const words = ann.note.trim().split(/\s+/);
                                const displayText = words.slice(0, 2).join(' ');

                                ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
                                ctx.textAlign = "center";
                                ctx.textBaseline = "middle";

                                const textWidth = ctx.measureText(displayText).width;
                                const boxPadding = 6;
                                const boxWidth = textWidth + boxPadding * 2;
                                const boxHeight = 20;
                                const labelOffsetY = -18;

                                ctx.fillStyle = "#362b44";
                                ctx.beginPath();
                                ctx.roundRect(xPx - boxWidth / 2, yPx + labelOffsetY - boxHeight / 2, boxWidth, boxHeight, 4);
                                ctx.fill();

                                ctx.fillStyle = "#fff";
                                ctx.fillText(displayText, xPx, yPx + labelOffsetY);
                            });
                        });

                        ctx.restore();
                    },
                ],
                setCursor: [
                    (u) => {
                        const idx = u.cursor.idx;
                        const leftPx = u.cursor.left;
                        const topPx = u.cursor.top;

                        if (idx == null || leftPx == null || topPx == null) {
                            tooltip.style.display = "none";
                            annTooltip.style.display = "none";
                            chartRef.current.style.cursor = 'crosshair';
                            return;
                        }

                        const yVal = u.posToVal(topPx, "y");
                        let lane = Math.floor(yVal);
                        lane = Math.max(0, Math.min(activeSeries.length - 1, lane));

                        const m = laneMeta[lane];
                        const s = seriesWithData[lane];
                        const timestamp = timestamps[idx];
                        const date = new Date(timestamp * 1000);
                        const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
                        const yOrig = s.data[idx];

                        const mouseXCanvas = u.bbox.left + leftPx;
                        const mouseYCanvas = u.bbox.top + topPx;
                        let hoveringAnnotation = null;

                        for (const hitbox of annotationHitboxes.current) {
                            const dx = mouseXCanvas - hitbox.xPx;
                            const dy = mouseYCanvas - hitbox.yPx;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance <= hitbox.radius) {
                                hoveringAnnotation = hitbox.annotation;
                                chartRef.current.style.cursor = 'pointer';
                                break;
                            }
                        }

                        if (hoveringAnnotation) {
                            tooltip.style.display = "none";
                            annTooltip.innerHTML = hoveringAnnotation.note;

                            const xPix = mouseXCanvas + 15;
                            const yPix = mouseYCanvas - 35;

                            const maxX = u.bbox.left + u.bbox.width - 320;
                            const maxY = u.bbox.top + u.bbox.height - 60;

                            annTooltip.style.left = Math.max(10, Math.min(xPix, maxX)) + "px";
                            annTooltip.style.top = Math.max(10, Math.min(yPix, maxY)) + "px";
                            annTooltip.style.display = "block";
                        } else {
                            tooltip.innerHTML = `
                                <div style="font-weight:600;color:${m.color}">${s.key}</div>
                                <div><b>${yOrig?.toFixed(3) ?? "—"}</b> | ${dateStr}</div>
                            `;

                            const xPix = u.bbox.left + leftPx + 10;
                            const yPix = u.bbox.top + topPx - 28;

                            const maxX = u.bbox.left + u.bbox.width - 8;
                            const maxY = u.bbox.top + u.bbox.height - 8;

                            tooltip.style.left = Math.min(xPix, maxX) + "px";
                            tooltip.style.top = Math.min(yPix, maxY) + "px";
                            tooltip.style.display = "block";
                            annTooltip.style.display = "none";
                            chartRef.current.style.cursor = 'crosshair';
                        }
                    },
                ],
            },
        };

        const chart = new uPlot(opts, data, chartRef.current);
        plotInstance.current = chart;

        const resizeObserver = new ResizeObserver(() => {
            const width = chartRef.current.clientWidth;
            chart.setSize({ width, height: activeSeries.length * 200 });
        });
        resizeObserver.observe(chartRef.current);

        const setXAll = (min, max) => chart.setScale("x", { min, max });

        const onWheel = (e) => {
            e.preventDefault();
            const rect = chartRef.current.getBoundingClientRect();
            const xVal = chart.posToVal(e.clientX - rect.left - chart.bbox.left, "x");
            const scale = e.deltaY < 0 ? 0.9 : 1.1;
            const { min, max } = chart.scales.x;
            const nx1 = xVal - (xVal - min) * scale;
            const nx2 = xVal + (max - xVal) * scale;
            setXAll(nx1, nx2);
        };

        let dragging = false, startX = 0, sMin = 0, sMax = 0;
        const onDown = (e) => {
            dragging = true;
            startX = e.clientX;
            const { min, max } = chart.scales.x;
            sMin = min; sMax = max;
        };
        const onMove = (e) => {
            if (!dragging) return;
            const dxPx = e.clientX - startX;
            const dxVal = chart.posToVal(0, "x") - chart.posToVal(dxPx, "x");
            setXAll(sMin + dxVal, sMax + dxVal);
        };
        const onUp = () => { dragging = false; };

        chartRef.current.addEventListener("wheel", onWheel, { passive: false });
        chartRef.current.addEventListener("mousedown", onDown);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);

        let isDragging = false;
        const onClick = (e) => {
            if (isDragging) {
                isDragging = false;
                return;
            }

            const rect = chartRef.current.getBoundingClientRect();
            const mouseXAbs = e.clientX;
            const mouseYAbs = e.clientY;

            for (const hitbox of annotationHitboxes.current) {
                const dx = mouseXAbs - hitbox.xPx;
                const dy = mouseYAbs - hitbox.yPx;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= hitbox.radius) {
                    setSelectedAnnotation(hitbox.annotation);
                    setShowViewModal(true);
                    return;
                }
            }

            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const offsetX = mouseX - chart.bbox.left;
            const offsetY = mouseY - chart.bbox.top;

            const xVal = chart.posToVal(offsetX, "x");
            const yVal = chart.posToVal(offsetY, "y");

            const laneIndex = Math.floor(yVal);
            const clampedLaneIndex = Math.max(0, Math.min(activeSeries.length - 1, laneIndex));
            const clickedSeries = activeSeries[clampedLaneIndex];
            const clickedChartName = clickedSeries.id.replace('toggle', '');

            setPendingAnnotation({
                x: xVal,
                y: yVal,
                chartName: clickedChartName
            });
            setShowModal(true);
        };

        chartRef.current.addEventListener("click", onClick);

        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.removeEventListener("wheel", onWheel);
                chartRef.current.removeEventListener("mousedown", onDown);
                chartRef.current.removeEventListener("click", onClick);
            }
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            if (plotInstance.current) {
                plotInstance.current.destroy();
                plotInstance.current = null;
            }
            tooltip.remove();
            annTooltip.remove();
        };
    }, [toggles, allAnnotations, chartType, liveData, activeSeries, periodUnit]);

    const handleSaveNote = () => {
        if (currentNote.trim() && pendingAnnotation && pendingAnnotation.chartName) {
            const selectedWearerId = localStorage.getItem('selectedWearerId');
            if (!selectedWearerId) {
                alert('No user selected. Please select a user first.');
                return;
            }

            const newAnnotation = {
                x: pendingAnnotation.x,
                y: pendingAnnotation.y,
                note: currentNote,
            };

            addAnnotation(pendingAnnotation.chartName, selectedWearerId, chartType, newAnnotation);

            const updatedAnnotationsMap = {};
            SERIES_CONFIG.forEach(series => {
                const chartName = series.id.replace('toggle', '');
                updatedAnnotationsMap[chartName] = getAnnotations(chartName, selectedWearerId, chartType);
            });
            setAllAnnotations(updatedAnnotationsMap);

            setCurrentNote("");
            setShowModal(false);
            setPendingAnnotation(null);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentNote("");
        setPendingAnnotation(null);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setSelectedAnnotation(null);
    };

    const handleDeleteAnnotation = () => {
        const selectedWearerId = localStorage.getItem('selectedWearerId');
        if (!selectedWearerId || !selectedAnnotation.chartName) return;

        deleteAnnotation(selectedAnnotation.chartName, selectedWearerId, selectedAnnotation);

        const updatedAnnotationsMap = {};
        SERIES_CONFIG.forEach(series => {
            const chartName = series.id.replace('toggle', '');
            updatedAnnotationsMap[chartName] = getAnnotations(chartName, selectedWearerId, chartType);
        });
        setAllAnnotations(updatedAnnotationsMap);

        setShowViewModal(false);
        setSelectedAnnotation(null);
    };

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <div ref={chartRef} className="chart-container" style={{
                width: '100%',
                position: 'relative',
                cursor: 'crosshair',
                height: activeSeries.length ? activeSeries.length * 200 : 0
            }}>
                <style>{`
                    .plot { width: 100%; position: relative; z-index: 41; }
                    .u-legend { display: none; }
                `}</style>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                            Add Note
                        </h3>
                        {pendingAnnotation && pendingAnnotation.chartName && (
                            <p style={{
                                margin: '0 0 16px 0',
                                fontSize: '13px',
                                color: '#666',
                                fontStyle: 'italic'
                            }}>
                                Chart: {pendingAnnotation.chartName}
                            </p>
                        )}
                        <textarea
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            placeholder="Enter your note here..."
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                marginBottom: '16px',
                                boxSizing: 'border-box'
                            }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNote}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: '#362b44',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showViewModal && selectedAnnotation && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                            Annotation Details
                        </h3>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            {selectedAnnotation.note}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: '16px'
                        }}>
                            <div>Chart: {selectedAnnotation.chartName}</div>
                            <div>Type: {selectedAnnotation.chartType}</div>
                            <div>Time: {new Date(selectedAnnotation.timestamp).toLocaleString()}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleDeleteAnnotation}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: '1px solid #dc3545',
                                    backgroundColor: 'white',
                                    color: '#dc3545',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Delete
                            </button>
                            <button
                                onClick={handleCloseViewModal}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: '#362b44',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompareChartComponents;