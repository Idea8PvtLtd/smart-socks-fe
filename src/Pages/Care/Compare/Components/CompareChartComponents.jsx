import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import {
  pulseRateVariabilityChartPush,
  pulseRateChartPush,
  skinConductanceChartPush,
  skinTemperatureChartPush,
} from "../../../../utils/CalmnessSubChartsPush";
import {
  stepTimeVariationChartPush,
  turnsChartPush,
  symmetryProxyChartPush,
  cadenceChartPush,
} from "../../../../utils/MobilitySubChartsPush";
import {
  walkingChartPush,
  stepsChartPush,
  boutsChartPush,
  longestBoutChartPush,
} from "../../../../utils/ActivitySubChartsPush";

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
  Stride: stepTimeVariationChartPush,
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

// --- “DB” helpers (localStorage) ---
const DB_KEY = "compareChart";
const getDatabase = () => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};
const saveDatabase = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));

const getAnnotations = (chartName, userId, chartType) => {
  const db = getDatabase();
  if (!chartName || !userId) return [];
  const userData = db[chartName]?.[userId];
  if (!userData) return [];
  const notes = [];
  Object.keys(userData).forEach((k) => {
    if (k.startsWith("Note")) {
      const note = userData[k];
      if (!chartType || note.chartType === chartType) notes.push(note);
    }
  });
  return notes;
};

const addAnnotation = (chartName, userId, chartType, annotation) => {
  if (!chartName || !userId) return;
  const db = getDatabase();
  db[chartName] = db[chartName] || {};
  db[chartName][userId] = db[chartName][userId] || {};
  const nextNumber = Object.keys(db[chartName][userId]).filter((k) => k.startsWith("Note")).length + 1;
  const key = `Note${nextNumber}`;
  db[chartName][userId][key] = {
    ...annotation,
    chartName,
    chartType,
    timestamp: new Date().toISOString(),
  };
  saveDatabase(db);
};

const deleteAnnotation = (chartName, userId, annotation) => {
  if (!chartName || !userId) return;
  const db = getDatabase();
  const userData = db[chartName]?.[userId];
  if (!userData) return;
  Object.keys(userData).forEach((k) => {
    if (!k.startsWith("Note")) return;
    const n = userData[k];
    if (n.timestamp === annotation.timestamp && n.x === annotation.x && n.y === annotation.y) {
      delete userData[k];
    }
  });
  saveDatabase(db);
};

// ---- Chart helpers ----
function onlyNums(arr) {
  return (arr || []).filter((v) => typeof v === "number" && isFinite(v));
}
function padRange(arr, pct = 0.12) {
  const n = onlyNums(arr);
  const lo = n.length ? Math.min(...n) : 0;
  const hi = n.length ? Math.max(...n) : 1;
  const span = Math.max(hi - lo, 1e-9);
  const pad = Math.max(span * pct, 1e-6);
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
    const denom = Math.max(hi - lo, 1e-9);

    laneMeta.push({ key: s.key, color: s.color, lo, hi, laneBottom, laneTop });

    return s.data.map((val) => {
      if (val == null || !isFinite(val)) return null;
      return laneBottom + ((val - lo) / denom) * (laneTop - laneBottom);
    });
  });

  return { data: [X, ...transformedSeries], laneMeta, yRange: [yGlobalMin, yGlobalMax] };
}

// Date range filter
function filterDataByDateRange(data, startDate, periodUnit) {
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
    case "year":
      end.setFullYear(end.getFullYear() + 1);
      break;
    default:
      end.setDate(end.getDate() + 1);
  }
  return data.filter((p) => {
    const d = new Date(p.time * 1000);
    return d >= start && d < end;
  });
}

function CompareChartComponents({
  toggles,
  chartType = "default",
  periodUnit = "day",
  startDate = "",
  chartName = "",
}) {
  const chartRef = useRef(null);
  const plotInstance = useRef(null);
  const [liveData, setLiveData] = useState({});

  // Build initial annotations map from storage
  const buildInitialAnnotationsMap = () => {
    const wearer = localStorage.getItem("selectedWearerId");
    const map = {};
    SERIES_CONFIG.forEach((s) => {
      const cName = s.id.replace("toggle", "");
      map[cName] = wearer ? getAnnotations(cName, wearer, chartType) : [];
    });
    return map;
  };

  const [allAnnotations, setAllAnnotations] = useState(buildInitialAnnotationsMap);
  const allAnnotationsRef = useRef(allAnnotations);
  useEffect(() => {
    allAnnotationsRef.current = allAnnotations;
  }, [allAnnotations]);

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [pendingAnnotation, setPendingAnnotation] = useState(null);

  const annotationHitboxes = useRef([]); // vertical strip hit boxes
  const annotationTooltip = useRef(null);

  const activeSeries = SERIES_CONFIG.filter((s) => toggles[s.id]);

  // Fetch live data
  useEffect(() => {
    const updateChartData = () => {
      const newData = {};
      SERIES_CONFIG.forEach((series) => {
        const source = DATA_SOURCES[series.dataKey];
        if (!source) return;
        let raw = source.getCurrentData();
        if (startDate && periodUnit) raw = filterDataByDateRange(raw, startDate, periodUnit);
        newData[series.dataKey] = raw;
      });
      setLiveData(newData);
    };

    Object.values(DATA_SOURCES).forEach((s) => s?.addListener?.(updateChartData));
    Object.values(DATA_SOURCES).forEach((s) => s?.startLiveUpdates?.());

    updateChartData();

    return () => {
      Object.values(DATA_SOURCES).forEach((s) => s?.removeListener?.(updateChartData));
      Object.values(DATA_SOURCES).forEach((s) => s?.stopLiveUpdates?.());
    };
  }, [startDate, periodUnit]);

  // Build/Update the chart
  useEffect(() => {
    if (!chartRef.current || activeSeries.length === 0) {
      if (plotInstance.current) {
        plotInstance.current.destroy();
        plotInstance.current = null;
      }
      return;
    }

    // assemble aligned timestamps and per-series original values
    const allTs = new Set();
    activeSeries.forEach((s) => (liveData[s.dataKey] || []).forEach((p) => allTs.add(p.time)));
    const timestamps = Array.from(allTs).sort((a, b) => a - b);
    if (timestamps.length === 0) return;

    const seriesWithData = activeSeries.map((s) => {
      const map = new Map((liveData[s.dataKey] || []).map((d) => [d.time, d.value]));
      return { ...s, data: timestamps.map((t) => map.get(t) ?? null) };
    });

    const { data, laneMeta, yRange } = makeLanesTransformed(timestamps, seriesWithData);

    // tooltips
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
      zIndex: "10",
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
      lineHeight: "1.4",
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
          values: (_u, vals) =>
            vals.map((v) => {
              const d = new Date(v * 1000);
              if (periodUnit === "day") {
                const hh = String(d.getHours()).padStart(2, "0");
                const mm = String(d.getMinutes()).padStart(2, "0");
                return `${hh}:${mm}`;
              } else {
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                return `${m}/${dd}`;
              }
            }),
        },
        { scale: "y", show: false, grid: { show: false } },
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
      // BOTH crosshair lines
      cursor: { focus: { prox: 24 }, x: true, y: true },
      hooks: {
        draw: [
          (u) => {
            const annsMap = allAnnotationsRef.current || {};
            const { ctx } = u;
            const padL = u.bbox.left;
            const padR = u.bbox.left + u.bbox.width;

            ctx.save();
            ctx.textBaseline = "middle";

            // left spine
            ctx.strokeStyle = "rgba(0,0,0,0.25)";
            ctx.beginPath();
            ctx.moveTo(padL, u.bbox.top);
            ctx.lineTo(padL, u.bbox.top + u.bbox.height);
            ctx.stroke();

            // per-lane grids & labels
            const tickCount = 5;
            laneMeta.forEach((m, i) => {
              const yTopPx = u.valToPos(m.laneTop, "y", true);
              const yBotPx = u.valToPos(m.laneBottom, "y", true);

              // top separator
              ctx.strokeStyle = "rgba(0,0,0,0.10)";
              ctx.beginPath();
              ctx.moveTo(padL, yTopPx);
              ctx.lineTo(padR, yTopPx);
              ctx.stroke();

              // lane label (right)
              ctx.fillStyle = m.color;
              ctx.font = "600 12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
              ctx.textAlign = "right";
              ctx.fillText(m.key, padR - 6, yTopPx + 14);

              // original value ticks
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

              // bottom separator on last lane
              if (i === laneMeta.length - 1) {
                ctx.strokeStyle = "rgba(0,0,0,0.10)";
                ctx.beginPath();
                ctx.moveTo(padL, yBotPx);
                ctx.lineTo(padR, yBotPx);
                ctx.stroke();
              }
            });

            // -------- Full-height vertical annotation lines --------
            annotationHitboxes.current = [];
            const topPxAll = u.bbox.top;
            const botPxAll = u.bbox.top + u.bbox.height;

            activeSeries.forEach((series, laneIndex) => {
              const cName = series.id.replace("toggle", "");
              const notes = annsMap[cName] || [];

              notes.forEach((ann) => {
                // ensure this note belongs to this sub-chart
                if (ann.chartName !== cName) return;

                const xPx = u.valToPos(ann.x, "x", true);

                // hitbox as vertical strip
                const halfW = 6;
                annotationHitboxes.current.push({
                  x1: xPx - halfW,
                  x2: xPx + halfW,
                  y1: topPxAll,
                  y2: botPxAll,
                  xPx,
                  annotation: ann,
                });

                // draw vertical line
                ctx.strokeStyle = "#362b44";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(xPx, topPxAll);
                ctx.lineTo(xPx, botPxAll);
                ctx.stroke();

                // label at the top (first 2 words)
                const words = String(ann.note || "").trim().split(/\s+/);
                const displayText = words.slice(0, 2).join(" ");
                ctx.font = "600 13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
                const textW = ctx.measureText(displayText).width;
                const padX = 6;
                const w = textW + padX * 2;
                const h = 22;

                const labelX = Math.min(
                  Math.max(xPx - w / 2, u.bbox.left + 4),
                  u.bbox.left + u.bbox.width - w - 4
                );
                const labelY = topPxAll + 4;

                ctx.fillStyle = "#362b44";
                if (typeof ctx.roundRect === "function") {
                  ctx.beginPath();
                  ctx.roundRect(labelX, labelY, w, h, 4);
                  ctx.fill();
                } else {
                  ctx.fillRect(labelX, labelY, w, h);
                }

                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(displayText, labelX + w / 2, labelY + h / 2);
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
            const annTooltipEl = annotationTooltip.current;

            if (idx == null || leftPx == null || topPx == null) {
              const t = chartRef.current.querySelector(":scope > div");
              if (t) t.style.display = "none";
              if (annTooltipEl) annTooltipEl.style.display = "none";
              chartRef.current.style.cursor = "crosshair";
              return;
            }

            const tooltipEl = chartRef.current.querySelector(":scope > div"); // first created tooltip
            const yVal = u.posToVal(topPx, "y");
            let lane = Math.floor(yVal);
            lane = Math.max(0, Math.min(activeSeries.length - 1, lane));

            const s = activeSeries[lane];
            const sData = (liveData[s.dataKey] || []).length
              ? (function () {
                  const map = new Map((liveData[s.dataKey] || []).map((d) => [d.time, d.value]));
                  return u.data[0].map((t) => (map.has(t) ? map.get(t) : null));
                })()
              : [];

            const timestamps = u.data[0] || [];
            const tSec = timestamps[idx];
            const dateStr = isFinite(tSec) ? new Date(tSec * 1000).toLocaleString() : "—";
            const val = sData[idx];
            const valStr = val == null || !isFinite(val) ? "—" : Number(val).toFixed(3);

            // Hit-test vertical strips
            const mouseX = u.bbox.left + leftPx;
            const mouseY = u.bbox.top + topPx;
            let hoveringAnn = null;
            for (const hb of annotationHitboxes.current) {
              if (mouseX >= hb.x1 && mouseX <= hb.x2 && mouseY >= hb.y1 && mouseY <= hb.y2) {
                hoveringAnn = hb.annotation;
                break;
              }
            }

            if (hoveringAnn) {
              if (tooltipEl) tooltipEl.style.display = "none";
              annTooltipEl.innerHTML = hoveringAnn.note || "";
              const xPix = mouseX + 15;
              const yPix = mouseY - 35;
              const maxX = u.bbox.left + u.bbox.width - 320;
              const maxY = u.bbox.top + u.bbox.height - 60;
              annTooltipEl.style.left = Math.max(10, Math.min(xPix, maxX)) + "px";
              annTooltipEl.style.top = Math.max(10, Math.min(yPix, maxY)) + "px";
              annTooltipEl.style.display = "block";
              chartRef.current.style.cursor = "pointer";
              return;
            } else {
              annTooltipEl.style.display = "none";
              chartRef.current.style.cursor = "crosshair";
            }

            // value tooltip
            tooltipEl.innerHTML = `
              <div style="font-weight:600;color:${s.color}">${s.key}</div>
              <div><b>${valStr}</b> | ${dateStr}</div>
            `;
            const xPix = u.bbox.left + leftPx + 10;
            const yPix = u.bbox.top + topPx - 28;
            const maxX = u.bbox.left + u.bbox.width - 8;
            const maxY = u.bbox.top + u.bbox.height - 8;
            tooltipEl.style.left = Math.min(xPix, maxX) + "px";
            tooltipEl.style.top = Math.min(yPix, maxY) + "px";
            tooltipEl.style.display = "block";
          },
        ],
      },
    };

    const chart = new uPlot(opts, data, chartRef.current);
    plotInstance.current = chart;

    // zoom/drag
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
    let dragging = false,
      startX = 0,
      sMin = 0,
      sMax = 0;
    const onDown = (e) => {
      dragging = true;
      startX = e.clientX;
      const { min, max } = chart.scales.x;
      sMin = min;
      sMax = max;
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dxPx = e.clientX - startX;
      const dxVal = chart.posToVal(0, "x") - chart.posToVal(dxPx, "x");
      setXAll(sMin + dxVal, sMax + dxVal);
    };
    const onUp = () => {
      dragging = false;
    };

    chartRef.current.addEventListener("wheel", onWheel, { passive: false });
    chartRef.current.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    // click to add / open note
    const onClick = (e) => {
      const rect = chartRef.current.getBoundingClientRect();
      const mouseXAbs = e.clientX;
      const mouseYAbs = e.clientY;

      // open existing note if vertical line clicked
      for (const hb of annotationHitboxes.current) {
        if (mouseXAbs >= hb.x1 && mouseXAbs <= hb.x2 && mouseYAbs >= hb.y1 && mouseYAbs <= hb.y2) {
          setSelectedAnnotation(hb.annotation);
          setShowViewModal(true);
          return;
        }
      }

      // else create pending note
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const offsetX = mouseX - chart.bbox.left;
      const offsetY = mouseY - chart.bbox.top;
      const xVal = chart.posToVal(offsetX, "x");
      const yVal = chart.posToVal(offsetY, "y");
      const laneIndex = Math.floor(yVal);
      const clampedLaneIndex = Math.max(0, Math.min(activeSeries.length - 1, laneIndex));
      const clickedSeries = activeSeries[clampedLaneIndex];
      const clickedChartName = clickedSeries.id.replace("toggle", "");

      setPendingAnnotation({ x: xVal, y: yVal, chartName: clickedChartName });
      setShowModal(true);
    };
    chartRef.current.addEventListener("click", onClick);

    // resize observer
    const resizeObserver = new ResizeObserver(() => {
      const width = chartRef.current.clientWidth;
      chart.setSize({ width, height: activeSeries.length * 200 });
    });
    resizeObserver.observe(chartRef.current);

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
  }, [toggles, liveData, chartType, periodUnit, activeSeries.length]);

  // ---- Note handlers (instant draw) ----
  const handleSaveNote = () => {
    if (!currentNote.trim() || !pendingAnnotation || !pendingAnnotation.chartName) return;
    const selectedWearerId = localStorage.getItem("selectedWearerId");
    if (!selectedWearerId) {
      alert("No user selected. Please select a user first.");
      return;
    }

    const newAnn = { x: pendingAnnotation.x, y: pendingAnnotation.y, note: currentNote };
    addAnnotation(pendingAnnotation.chartName, selectedWearerId, chartType, newAnn);

    // refresh annotations map
    const updated = {};
    SERIES_CONFIG.forEach((s) => {
      const cName = s.id.replace("toggle", "");
      updated[cName] = getAnnotations(cName, selectedWearerId, chartType);
    });
    allAnnotationsRef.current = updated; // update ref first for immediate draw
    setAllAnnotations(updated);

    // close modal & force redraw NOW
    setCurrentNote("");
    setShowModal(false);
    setPendingAnnotation(null);
    if (plotInstance.current) plotInstance.current.redraw();
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
    const selectedWearerId = localStorage.getItem("selectedWearerId");
    if (!selectedWearerId || !selectedAnnotation?.chartName) return;

    deleteAnnotation(selectedAnnotation.chartName, selectedWearerId, selectedAnnotation);

    const updated = {};
    SERIES_CONFIG.forEach((s) => {
      const cName = s.id.replace("toggle", "");
      updated[cName] = getAnnotations(cName, selectedWearerId, chartType);
    });
    allAnnotationsRef.current = updated;
    setAllAnnotations(updated);

    setShowViewModal(false);
    setSelectedAnnotation(null);
    if (plotInstance.current) plotInstance.current.redraw();
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div
        ref={chartRef}
        className="chart-container"
        style={{
          width: "100%",
          position: "relative",
          cursor: "crosshair",
          height: activeSeries.length ? activeSeries.length * 200 : 0,
        }}
      >
        <style>{`
          .plot { width: 100%; position: relative; z-index: 41; }
          .u-legend { display: none; }
        `}</style>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 600 }}>Add Note</h3>
            {pendingAnnotation?.chartName && (
              <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#666", fontStyle: "italic" }}>
                Chart: {pendingAnnotation.chartName}
              </p>
            )}
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Enter your note here..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                marginBottom: "16px",
                boxSizing: "border-box",
              }}
              autoFocus
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#362b44",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedAnnotation && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 600 }}>
              Annotation Details
            </h3>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {selectedAnnotation.note}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "16px" }}>
              <div>Chart: {selectedAnnotation.chartName}</div>
              <div>Type: {selectedAnnotation.chartType}</div>
              <div>Time: {new Date(selectedAnnotation.timestamp).toLocaleString()}</div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={handleDeleteAnnotation}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid #dc3545",
                  backgroundColor: "white",
                  color: "#dc3545",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Delete
              </button>
              <button
                onClick={handleCloseViewModal}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#362b44",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
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
