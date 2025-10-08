import React from 'react'

const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
const colorFor = (v) => (v <= 4 ? 'red-bar' : v <= 6.33 ? 'amber-bar' : 'green-bar');

function BarMeter({ label, value, max = 10 }) {
    const v = clamp(Number(value ?? 0), 0, max);
    const pct = (v / max) * 100;
    const barClass = colorFor(v);

    return (
        <div className="meter-row" role="img" aria-label={`${label} ${v} out of ${max}`}>
            <div className="meter">
                <div className={`meter-fill ${barClass}`} style={{ width: `${pct}%` }} />
                <div className="meter-baseline" />
            </div>
            <div className="meter-label">
                <span className="meter-label-text">{label}</span>
                <span className="meter-value">{v}/10</span>
            </div>
        </div>
    );
}

function BarChart({ activity, calmness, mobility }) {
    return (
        <div className="chartCard">
            <BarMeter label="Activity" value={activity} />
            <BarMeter label="Calmness" value={calmness} />
            <BarMeter label="Mobility" value={mobility} />
        </div>
    );
}

export default BarChart
