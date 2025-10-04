import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

// ---------- Data ----------
const X = [1980, 1982, 1984, 1986, 1988, 1990, 1992, 1994, 1996];
const Steps = [12, 15, 18, 22, 28, 31, 29, 25, 20];
const Bouts = [5.2, 6.1, 7.4, 8.0, 7.8, 7.1, 6.5, 6.0, 5.5];
const Longest = [42, 39, 37, 33, 28, 25, 21, 18, 15];
const Walking = [1.2, 1.3, 1.1, 0.9, 0.8, 0.75, 0.7, 0.65, 0.6];
const Hart = [72, 75, 80, 85, 90, 88, 83, 78, 74];
const Pulse = [60, 63, 65, 70, 74, 71, 68, 66, 62];
const conductance = [0.18, 0.22, 0.27, 0.33, 0.38, 0.36, 0.32, 0.28, 0.25];
const Temperature = [36.4, 36.6, 36.9, 37.2, 37.0, 36.8, 36.5, 36.3, 36.1];
const Cadence = [110, 115, 120, 125, 122, 118, 114, 111, 109];
const Step = [0.45, 0.47, 0.49, 0.50, 0.52, 0.51, 0.48, 0.46, 0.44];
const Symmetry = [0.95, 0.92, 0.90, 0.88, 0.86, 0.85, 0.83, 0.82, 0.80];
const Turns = [8, 10, 12, 15, 14, 13, 11, 9, 7];
const Stride = [0.75, 0.80, 0.82, 0.85, 0.83, 0.81, 0.78, 0.76, 0.73];


const SERIES = [
    { id: "toggleSteps", key: "Steps Chart", color: "#0077B6", data: Steps },
    { id: "toggleBouts", key: "Bouts Chart", color: "#6E9600", data: Bouts },
    { id: "toggleLongest", key: "Longest Bout Chart", color: "#F50B5D", data: Longest },
    { id: "toggleWalking", key: "Walking Chart", color: "#FF0000", data: Walking },

    { id: "toggleHeart", key: "Pulserate variability", color: "#000000", data: Hart },
    { id: "togglePulse", key: "Pulse rate", color: "#673A8F", data: Pulse },
    { id: "toggleSkin", key: "Skin conductance", color: "#44B649", data: conductance },
    { id: "toggleSkinTemperature", key: "Skin Temperature", color: "#FF6600", data: Temperature },

    { id: "toggleCadence", key: "Cadence Chart", color: "#FF00C8", data: Cadence },
    { id: "toggleStepTiming", key: "Step Timing Variation", color: "#FF6600", data: Step },
    { id: "toggleSymmetryProxy", key: "Symmetry Proxy Chart", color: "#00A661", data: Symmetry },
    { id: "toggleTurns", key: "Turns Chart", color: "#EF4444", data: Turns },
    { id: "toggleStride", key: "Stride Time Chart", color: "#0B3EF5", data: Stride },
];

// ---------- Database Helper Functions ----------
const DB_KEY = 'compareChart';

// Get the entire database
const getDatabase = () => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : {};
};

// Save the entire database
const saveDatabase = (db) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// Get annotations for specific chart, user, and type
const getAnnotations = (chartName, userId, chartType) => {
    const db = getDatabase();

    if (!chartName || !userId) return [];

    // Navigate through the structure
    const chartData = db[chartName];
    if (!chartData) return [];

    const userData = chartData[userId];
    if (!userData) return [];

    // Convert Note1, Note2, etc. back to array
    const annotations = [];
    Object.keys(userData).forEach(key => {
        if (key.startsWith('Note')) {
            const note = userData[key];
            // Filter by chartType if specified
            if (!chartType || note.chartType === chartType) {
                annotations.push(note);
            }
        }
    });

    return annotations;
};

// Add new annotation
const addAnnotation = (chartName, userId, chartType, annotation) => {
    if (!chartName || !userId) return;

    const db = getDatabase();

    // Initialize structure if needed
    if (!db[chartName]) {
        db[chartName] = {};
    }
    if (!db[chartName][userId]) {
        db[chartName][userId] = {};
    }

    // Find next available note number
    const existingNotes = Object.keys(db[chartName][userId]).filter(k => k.startsWith('Note'));
    const nextNumber = existingNotes.length + 1;
    const noteKey = `Note${nextNumber}`;

    // Save annotation with all required fields
    db[chartName][userId][noteKey] = {
        ...annotation,
        chartName,
        chartType,
        timestamp: new Date().toISOString()
    };

    saveDatabase(db);
};

// Delete annotation
const deleteAnnotation = (chartName, userId, annotation) => {
    if (!chartName || !userId) return;

    const db = getDatabase();

    if (!db[chartName] || !db[chartName][userId]) return;

    // Find and delete the matching note
    Object.keys(db[chartName][userId]).forEach(key => {
        if (key.startsWith('Note')) {
            const note = db[chartName][userId][key];
            // Match by timestamp and coordinates
            if (note.timestamp === annotation.timestamp &&
                note.x === annotation.x &&
                note.y === annotation.y) {
                delete db[chartName][userId][key];
            }
        }
    });

    saveDatabase(db);
};

// ---------- Helpers ----------
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

function CompareChartComponents({ toggles, chartType = 'default', chartName = '' }) {
    const chartRef = useRef(null);
    const plotInstance = useRef(null);

    // Load all annotations for all possible charts
    const [allAnnotations, setAllAnnotations] = useState(() => {
        const selectedWearerId = localStorage.getItem('selectedWearerId');
        if (!selectedWearerId) return {};

        const annotationsMap = {};
        SERIES.forEach(series => {
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

    const activeSeries = SERIES.filter(series => toggles[series.id]);

    useEffect(() => {
        if (!chartRef.current) return;

        if (activeSeries.length === 0) {
            if (plotInstance.current) {
                plotInstance.current.destroy();
                plotInstance.current = null;
            }
            return;
        }

        const { data, laneMeta, yRange } = makeLanesTransformed(X, activeSeries);

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
                    values: (u, vals) => vals.map(v => v.toString()),
                },
                {
                    scale: "y",
                    show: false,
                    grid: { show: false },
                },
            ],
            series: [
                {},
                ...activeSeries.map((s) => ({
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

                        // Draw annotations only for active series and in correct lanes
                        activeSeries.forEach((series, laneIndex) => {
                            const chartName = series.id.replace('toggle', '');
                            const annotations = allAnnotations[chartName] || [];

                            annotations.forEach((ann, index) => {
                                // CRITICAL: Only draw if this annotation was created for THIS specific chart
                                if (ann.chartName !== chartName) {
                                    return; // Skip annotations that don't belong to this chart
                                }

                                const xPx = u.valToPos(ann.x, "x", true);

                                // Get the current lane boundaries
                                const storedLaneIndex = Math.floor(ann.y);
                                const fractionalY = ann.y - storedLaneIndex;

                                // Map to current lane
                                const newY = laneIndex + fractionalY;
                                const yPx = u.valToPos(newY, "y", true);

                                annotationHitboxes.current.push({
                                    xPx: xPx,
                                    yPx: yPx,
                                    radius: 10,
                                    annotation: ann,
                                    index: index,
                                    chartName: chartName
                                });

                                // ... rest of the drawing code remains the same
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
                        const N = SERIES.length;
                        let lane = Math.floor(yVal);
                        lane = Math.max(0, Math.min(N - 1, lane));

                        const m = laneMeta[lane];
                        const s = activeSeries[lane];
                        const year = X[idx];
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
                                <div><b>${yOrig?.toFixed(3) ?? "—"}</b> | ${year}</div>
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
            chart.setSize({
                width,
                height: activeSeries.length * 200
            });
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

            // Determine which lane/chart was clicked
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
    }, [toggles, allAnnotations, chartType, chartName]);

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

            // Add to database with the correct chart name
            addAnnotation(pendingAnnotation.chartName, selectedWearerId, chartType, newAnnotation);

            // Reload all annotations
            const updatedAnnotationsMap = {};
            SERIES.forEach(series => {
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

        // Delete from database using the annotation's chart name
        deleteAnnotation(selectedAnnotation.chartName, selectedWearerId, selectedAnnotation);

        // Reload all annotations
        const updatedAnnotationsMap = {};
        SERIES.forEach(series => {
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