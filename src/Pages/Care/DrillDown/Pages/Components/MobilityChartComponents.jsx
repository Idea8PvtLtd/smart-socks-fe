import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import {
  stepTimeVariationChartPush,
  turnsChartPush,
  symmetryProxyChartPush,
  cadenceChartPush,
} from "../../../../../utils/MobilitySubChartsPush";

const STORAGE_KEY = "mobility_chart_annotations";

// ---------- Helpers ----------
function onlyNums(arr) {
  return arr.filter((v) => typeof v === "number" && isFinite(v));
}

function padRange(arr, pct = 0.12) {
  const nums = onlyNums(arr || []);
  const lo0 = nums.length ? Math.min(...nums) : 0;
  const hi0 = nums.length ? Math.max(...nums) : 1;
  const span = Math.max(hi0 - lo0, 1e-9);
  const pad = Math.max(span * pct, 1e-6);
  return [lo0 - pad, hi0 + pad];
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
    const denom = (hi - lo) || 1e-9;

    laneMeta.push({ key: s.key, color: s.color, lo, hi, laneBottom, laneTop });

    return s.data.map((val) => {
      if (val == null || !isFinite(val)) return null;
      return laneBottom + ((val - lo) / denom) * (laneTop - laneBottom);
    });
  });

  return {
    data: [X, ...transformedSeries],
    laneMeta,
    yRange: [yGlobalMin, yGlobalMax],
  };
}

function ordinalDay(day) {
  if (day >= 11 && day <= 13) return `${day}th`;
  const last = day % 10;
  if (last === 1) return `${day}st`;
  if (last === 2) return `${day}nd`;
  if (last === 3) return `${day}rd`;
  return `${day}th`;
}

function MobilityChartComponents() {
  const chartRef = useRef(null);
  const plotInstance = useRef(null);

  // refs for latest data used by hooks
  const rawSeriesRef = useRef([]);
  const xRef = useRef([]);
  const laneMetaRef = useRef([]);
  const annotationsRef = useRef([]); // <— draw from here for instant updates

  // load persisted notes once
  const initialNotes = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const [annotations, setAnnotations] = useState(initialNotes);
  // keep ref in sync (first render + any later changes)
  useEffect(() => {
    annotationsRef.current = annotations;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  }, [annotations]);

  const [liveData, setLiveData] = useState({
    X: [],
    Cadence: [],
    Symmetry: [],
    Turns: [],
    StepTime: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [pendingAnnotation, setPendingAnnotation] = useState(null);

  const annotationHitboxes = useRef([]); // vertical strip hitboxes
  const annotationTooltip = useRef(null);

  // live data
  useEffect(() => {
    const updateChartData = () => {
      const cadenceData = cadenceChartPush.getCurrentData();
      const symmetryData = symmetryProxyChartPush.getCurrentData();
      const turnsData = turnsChartPush.getCurrentData();
      const stepTimeData = stepTimeVariationChartPush.getCurrentData();

      const allTimestamps = new Set();
      [cadenceData, symmetryData, turnsData, stepTimeData].forEach((ds) =>
        ds.forEach((p) => allTimestamps.add(p.time))
      );
      const timestamps = Array.from(allTimestamps).sort((a, b) => a - b);

      const toMap = (arr) => new Map(arr.map((d) => [d.time, d.value]));
      const cadenceMap = toMap(cadenceData);
      const symmetryMap = toMap(symmetryData);
      const turnsMap = toMap(turnsData);
      const stepTimeMap = toMap(stepTimeData);

      const cadence = timestamps.map((t) => cadenceMap.get(t) ?? null);
      const symmetry = timestamps.map((t) => symmetryMap.get(t) ?? null);
      const turns = timestamps.map((t) => turnsMap.get(t) ?? null);
      const stepTime = timestamps.map((t) => stepTimeMap.get(t) ?? null);

      setLiveData({
        X: timestamps,
        Cadence: cadence,
        Symmetry: symmetry,
        Turns: turns,
        StepTime: stepTime,
      });
    };

    cadenceChartPush.addListener(updateChartData);
    symmetryProxyChartPush.addListener(updateChartData);
    turnsChartPush.addListener(updateChartData);
    stepTimeVariationChartPush.addListener(updateChartData);

    cadenceChartPush.startLiveUpdates();
    symmetryProxyChartPush.startLiveUpdates();
    turnsChartPush.startLiveUpdates();
    stepTimeVariationChartPush.startLiveUpdates();

    updateChartData();

    return () => {
      cadenceChartPush.removeListener(updateChartData);
      symmetryProxyChartPush.removeListener(updateChartData);
      turnsChartPush.removeListener(updateChartData);
      stepTimeVariationChartPush.removeListener(updateChartData);

      cadenceChartPush.stopLiveUpdates();
      symmetryProxyChartPush.stopLiveUpdates();
      turnsChartPush.stopLiveUpdates();
      stepTimeVariationChartPush.stopLiveUpdates();
    };
  }, []);

  // create chart once
  useEffect(() => {
    if (!chartRef.current) return;

    // seed to avoid NaNs
    const SERIES = [
      { key: "Cadence", color: "#FF00C8", data: [0, 1, 0] },
      { key: "Symmetry Proxy", color: "#00A661", data: [0, 1, 0] },
      { key: "Turns", color: "#EF4444", data: [0, 1, 0] },
      { key: "Stride variability", color: "#0B3EF5", data: [0, 1, 0] },
    ];
    rawSeriesRef.current = SERIES;
    xRef.current = [0, 1, 2];
    annotationsRef.current = initialNotes; // ensure draw sees initial

    const { data, laneMeta, yRange } = makeLanesTransformed(xRef.current, SERIES);
    laneMetaRef.current = laneMeta;

    const N = SERIES.length;

    const tooltip = document.createElement("div");
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
    chartRef.current.appendChild(tooltip);

    const annTooltip = document.createElement("div");
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
    chartRef.current.appendChild(annTooltip);
    annotationTooltip.current = annTooltip;

    const opts = {
      width: chartRef.current.clientWidth,
      height: 180 * N,
      padding: [null, 16, null, 64],
      scales: { x: { time: false }, y: { range: yRange } },
      axes: [
        {
          scale: "x",
          grid: { show: true },
          values: (_u, vals) =>
            vals.map((v) => {
              const d = new Date(v * 1000);
              return ordinalDay(d.getDate());
            }),
        },
        { scale: "y", show: false, grid: { show: false } },
      ],
      series: [
        {},
        ...SERIES.map((s) => ({
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
            const lm = laneMetaRef.current || [];
            const anns = annotationsRef.current || []; // <— read from ref
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

            const tickCount = 5;

            lm.forEach((m, i) => {
              const yTopPx = u.valToPos(m.laneTop, "y", true);
              const yBotPx = u.valToPos(m.laneBottom, "y", true);

              // top lane separator
              ctx.strokeStyle = "rgba(0,0,0,0.10)";
              ctx.beginPath();
              ctx.moveTo(padL, yTopPx);
              ctx.lineTo(padR, yTopPx);
              ctx.stroke();

              // lane label
              ctx.fillStyle = m.color;
              ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
              ctx.textAlign = "right";
              ctx.fillText(m.key, padR - 6, yTopPx + 14);

              // per-lane numeric ticks (original-value space)
              ctx.fillStyle = "#444";
              ctx.font = "11px system-ui, -apple-system, Segoe UI, Roboto, Arial";
              ctx.textAlign = "right";

              for (let j = 0; j <= tickCount; j++) {
                const frac = j / tickCount;
                const val = m.lo + frac * (m.hi - m.lo);
                const yValLane = m.laneBottom + frac * (m.laneTop - m.laneBottom);
                const yPx = u.valToPos(yValLane, "y", true);

                ctx.fillText(val.toFixed(3), padL - 8, yPx);

                ctx.strokeStyle = "rgba(0,0,0,0.06)";
                ctx.beginPath();
                ctx.moveTo(padL, yPx);
                ctx.lineTo(padR, yPx);
                ctx.stroke();
              }

              // reference lines per lane (original-value space)
              const referenceLines = {
                Cadence: { start: 42, end: 53 },
                "Symmetry Proxy": { start: 0.895, end: 0.901 },
                Turns: { start: 1.855, end: 1.973 },
                "Stride variability": { start: 0.432, end: 0.581 },
              };

              const refs = referenceLines[m.key];
              if (refs) {
                const toLaneY = (orig) =>
                  m.laneBottom +
                  ((orig - m.lo) / Math.max(m.hi - m.lo, 1e-9)) * (m.laneTop - m.laneBottom);

                // start line
                ctx.strokeStyle = m.color;
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(padL, u.valToPos(toLaneY(refs.start), "y", true));
                ctx.lineTo(padR, u.valToPos(toLaneY(refs.start), "y", true));
                ctx.stroke();

                // end line
                ctx.beginPath();
                ctx.moveTo(padL, u.valToPos(toLaneY(refs.end), "y", true));
                ctx.lineTo(padR, u.valToPos(toLaneY(refs.end), "y", true));
                ctx.stroke();

                ctx.setLineDash([]);
                ctx.lineWidth = 1;
              }

              // bottom separator on last lane
              if (i === lm.length - 1) {
                ctx.strokeStyle = "rgba(0,0,0,0.10)";
                ctx.beginPath();
                ctx.moveTo(padL, yBotPx);
                ctx.lineTo(padR, yBotPx);
                ctx.stroke();
              }
            });

            // ---------- FULL-HEIGHT VERTICAL ANNOTATION LINES ----------
            annotationHitboxes.current = [];
            const topPxAll = u.bbox.top;
            const botPxAll = u.bbox.top + u.bbox.height;

            anns.forEach((ann) => {
              const xPx = u.valToPos(ann.x, "x", true);

              // hitbox as a vertical strip
              const halfW = 6; // px tolerance
              annotationHitboxes.current.push({
                xPx,
                x1: xPx - halfW,
                x2: xPx + halfW,
                y1: topPxAll,
                y2: botPxAll,
                annotation: ann,
              });

              // the vertical line
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
              const textWidth = ctx.measureText(displayText).width;
              const padX = 6, h = 22, w = textWidth + padX * 2;

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
              ctx.textBaseline = "middle";
              ctx.textAlign = "center";
              ctx.fillText(displayText, labelX + w / 2, labelY + h / 2);
            });

            ctx.restore();
          },
        ],
        setCursor: [
          (u) => {
            const idx = u.cursor.idx;
            const leftPx = u.cursor.left;
            const topPx = u.cursor.top;
            const annTooltip = annotationTooltip.current;
            const tooltip = chartRef.current.querySelector(":scope > div");

            if (idx == null || leftPx == null || topPx == null) {
              if (tooltip) tooltip.style.display = "none";
              if (annTooltip) annTooltip.style.display = "none";
              return;
            }

            const yVal = u.posToVal(topPx, "y");
            const N = rawSeriesRef.current.length;
            let lane = Math.floor(yVal);
            lane = Math.max(0, Math.min(N - 1, lane));

            const s = rawSeriesRef.current[lane];
            const timestamp = xRef.current[idx];
            const date = new Date((timestamp ?? 0) * 1000);
            const dateStr = isFinite(timestamp) ? date.toLocaleString() : "—";

            // hit-test annotations (vertical strip)
            const mouseXCanvas = u.bbox.left + leftPx;
            const mouseYCanvas = u.bbox.top + topPx;
            let hoveringAnnotation = null;

            for (const hb of annotationHitboxes.current) {
              if (
                mouseXCanvas >= hb.x1 &&
                mouseXCanvas <= hb.x2 &&
                mouseYCanvas >= hb.y1 &&
                mouseYCanvas <= hb.y2
              ) {
                hoveringAnnotation = hb.annotation;
                chartRef.current.style.cursor = "pointer";
                break;
              }
            }

            if (hoveringAnnotation) {
              if (tooltip) tooltip.style.display = "none";
              annTooltip.innerHTML = hoveringAnnotation.note || "";
              const xPix = u.bbox.left + leftPx + 15;
              const yPix = u.bbox.top + topPx - 35;
              const maxX = u.bbox.left + u.bbox.width - 320;
              const maxY = u.bbox.top + u.bbox.height - 60;
              annTooltip.style.left = Math.max(10, Math.min(xPix, maxX)) + "px";
              annTooltip.style.top = Math.max(10, Math.min(yPix, maxY)) + "px";
              annTooltip.style.display = "block";
              return;
            } else {
              annTooltip.style.display = "none";
              chartRef.current.style.cursor = "crosshair";
            }

            // lane value tooltip (raw value)
            const val = s && s.data ? s.data[idx] : null;
            const valStr = val == null || !isFinite(val) ? "—" : Number(val).toFixed(3);

            tooltip.innerHTML = `
              <div style="font-weight:600; color:white; margin-bottom:5px;">${s?.key ?? ""}</div>
              <div><b>${valStr}</b> | ${dateStr}</div>
            `;

            const xPix = u.bbox.left + leftPx + 10;
            const yPix = u.bbox.top + topPx - 28;
            const maxX = u.bbox.left + u.bbox.width - 8;
            const maxY = u.bbox.top + u.bbox.height - 8;
            tooltip.style.left = Math.min(xPix, maxX) + "px";
            tooltip.style.top = Math.min(yPix, maxY) + "px";
            tooltip.style.display = "block";
          },
        ],
      },
    };

    const chart = new uPlot(opts, data, chartRef.current);
    plotInstance.current = chart;

    const resizeObserver = new ResizeObserver(() => {
      const width = chartRef.current.clientWidth;
      chart.setSize({ width, height: 180 * SERIES.length });
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

    let startX = 0,
      sMin = 0,
      sMax = 0;
    let isDragging = false;

    const onDown = (e) => {
      startX = e.clientX;
      const { min, max } = chart.scales.x;
      sMin = min;
      sMax = max;
      isDragging = false;
    };

    const onMove = (e) => {
      if (startX === 0) return;
      const distance = Math.abs(e.clientX - startX);
      if (distance > 5) {
        isDragging = true;
        const dxPx = e.clientX - startX;
        const dxVal = chart.posToVal(0, "x") - chart.posToVal(dxPx, "x");
        setXAll(sMin + dxVal, sMax + dxVal);
      }
    };

    const onUp = () => {
      startX = 0;
    };

    const onClick = (e) => {
      if (isDragging) {
        isDragging = false;
        return;
      }

      const rect = chartRef.current.getBoundingClientRect();
      const mouseXAbs = e.clientX;
      const mouseYAbs = e.clientY;

      // check annotation clicks first (vertical strip)
      for (const hb of annotationHitboxes.current) {
        if (mouseXAbs >= hb.x1 && mouseXAbs <= hb.x2 && mouseYAbs >= hb.y1 && mouseYAbs <= hb.y2) {
          setSelectedAnnotation(hb.annotation);
          setShowViewModal(true);
          return;
        }
      }

      // create pending annotation
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const offsetX = mouseX - chart.bbox.left;
      const offsetY = mouseY - chart.bbox.top;
      const xVal = chart.posToVal(offsetX, "x");
      const yVal = chart.posToVal(offsetY, "y"); // kept for future lane-level notes
      setPendingAnnotation({ x: xVal, y: yVal });
      setShowModal(true);
    };

    chartRef.current.addEventListener("wheel", onWheel, { passive: false });
    chartRef.current.addEventListener("mousedown", onDown);
    chartRef.current.addEventListener("click", onClick);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

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
  }, []); // once

  // Update chart when liveData changes
  useEffect(() => {
    if (!plotInstance.current || liveData.X.length === 0) return;

    const SERIES = [
      { key: "Cadence", color: "#FF00C8", data: liveData.Cadence },
      { key: "Symmetry Proxy", color: "#00A661", data: liveData.Symmetry },
      { key: "Turns", color: "#EF4444", data: liveData.Turns },
      { key: "Stride variability", color: "#0B3EF5", data: liveData.StepTime },
    ];
    rawSeriesRef.current = SERIES;
    xRef.current = liveData.X;

    const { min, max } = plotInstance.current.scales.x;
    const savedMin = min;
    const savedMax = max;

    const { data, laneMeta } = makeLanesTransformed(liveData.X, SERIES);
    laneMetaRef.current = laneMeta;

    plotInstance.current.setData(data);

    if (savedMin != null && savedMax != null) {
      plotInstance.current.setScale("x", { min: savedMin, max: savedMax });
    } else {
      const L = liveData.X.length;
      if (L > 1) {
        const startIdx = Math.max(0, Math.floor(L * 0.95));
        plotInstance.current.setScale("x", {
          min: liveData.X[startIdx],
          max: liveData.X[L - 1],
        });
      }
    }
  }, [liveData]);

  // Redraw when annotations change (safety)
  useEffect(() => {
    plotInstance.current && plotInstance.current.redraw();
  }, [annotations]);

  const handleSaveNote = () => {
    if (currentNote.trim() && pendingAnnotation) {
      // update ref immediately for instant draw
      const next = [...annotationsRef.current, { ...pendingAnnotation, note: currentNote }];
      annotationsRef.current = next;
      // persist/state
      setAnnotations(next);
      // close & clear
      setCurrentNote("");
      setShowModal(false);
      setPendingAnnotation(null);
      // force paint now
      plotInstance.current && plotInstance.current.redraw();
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
    if (!selectedAnnotation) return;
    const next = annotationsRef.current.filter((ann) => ann !== selectedAnnotation);
    annotationsRef.current = next;
    setAnnotations(next);
    setShowViewModal(false);
    setSelectedAnnotation(null);
    plotInstance.current && plotInstance.current.redraw();
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div
        ref={chartRef}
        className="chart-container"
        style={{ width: "100%", position: "relative", cursor: "crosshair" }}
      />

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
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 600 }}>
              Add Note
            </h3>
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

export default MobilityChartComponents;
