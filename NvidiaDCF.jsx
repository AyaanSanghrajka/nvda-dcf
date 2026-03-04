import React, { useState, useMemo } from 'react';

const CURRENT_PRICE = 116.78;
const SHARES = 24.4; // billion shares

const C = {
  bg: '#020817',
  surface: '#0f172a',
  surface2: '#1e293b',
  border: '#1e293b',
  border2: '#334155',
  accent: '#06b6d4',
  accentDim: 'rgba(6,182,212,0.12)',
  green: '#10b981',
  greenDim: 'rgba(16,185,129,0.1)',
  red: '#ef4444',
  redDim: 'rgba(239,68,68,0.1)',
  yellow: '#f59e0b',
  text: '#e2e8f0',
  muted: '#64748b',
  muted2: '#94a3b8',
  mono: "'Courier New', 'Consolas', monospace",
};

function SliderInput({ label, value, setValue, min, max, step, unit }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
        <span style={{ color: C.muted, fontSize: '10px', fontFamily: C.mono, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
          {label}
        </span>
        <span style={{ color: C.accent, fontSize: '15px', fontFamily: C.mono, fontWeight: 'bold' }}>
          {unit === '$' ? `$${value}B` : `${value}%`}
        </span>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)',
          height: '3px', width: '100%', background: C.surface2, borderRadius: '2px',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)',
          height: '3px', width: `${pct}%`, background: C.accent, borderRadius: '2px',
          transition: 'width 0.1s',
        }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => setValue(Number(e.target.value))}
          style={{ position: 'relative', width: '100%', appearance: 'none', WebkitAppearance: 'none',
            background: 'transparent', cursor: 'pointer', height: '20px', margin: 0 }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        <span style={{ color: C.muted, fontSize: '9px', fontFamily: C.mono }}>
          {unit === '$' ? `$${min}B` : `${min}%`}
        </span>
        <span style={{ color: C.muted, fontSize: '9px', fontFamily: C.mono }}>
          {unit === '$' ? `$${max}B` : `${max}%`}
        </span>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${accent ? C.accent : C.border}`,
      borderRadius: '8px', padding: '16px 20px', flex: 1,
      boxShadow: accent ? `0 0 20px rgba(6,182,212,0.08)` : 'none',
    }}>
      <div style={{ color: C.muted, fontSize: '9px', fontFamily: C.mono, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ color: accent ? C.accent : C.text, fontSize: '22px', fontFamily: C.mono, fontWeight: 'bold', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ color: C.muted, fontSize: '10px', fontFamily: C.mono, marginTop: '6px' }}>{sub}</div>}
    </div>
  );
}

export default function NvidiaDCF() {
  const [growth15, setGrowth15] = useState(20);
  const [growth610, setGrowth610] = useState(12);
  const [fcfMargin, setFcfMargin] = useState(55);
  const [wacc, setWacc] = useState(10);
  const [termGrowth, setTermGrowth] = useState(3);
  const [baseRevenue, setBaseRevenue] = useState(60);

  const calc = useMemo(() => {
    const rows = [];
    let rev = baseRevenue;
    for (let yr = 1; yr <= 10; yr++) {
      const gr = (yr <= 5 ? growth15 : growth610) / 100;
      rev = rev * (1 + gr);
      const fcf = rev * (fcfMargin / 100);
      const df = 1 / Math.pow(1 + wacc / 100, yr);
      const pvFcf = fcf * df;
      rows.push({ yr, rev, fcf, df, pvFcf });
    }
    const totalPvFcf = rows.reduce((s, r) => s + r.pvFcf, 0);
    const wRate = wacc / 100;
    const tRate = termGrowth / 100;
    const tv = rows[9].fcf * (1 + tRate) / (wRate - tRate);
    const pvTv = tv / Math.pow(1 + wRate, 10);
    const ev = totalPvFcf + pvTv;
    const intrinsic = ev / SHARES;
    const mos = (intrinsic - CURRENT_PRICE) / intrinsic * 100;
    return { rows, totalPvFcf, tv, pvTv, ev, intrinsic, mos };
  }, [growth15, growth610, fcfMargin, wacc, termGrowth, baseRevenue]);

  const WACC_VALS = [8, 9, 10, 11, 12];
  const GROWTH_VALS = [10, 15, 20, 25, 30];

  const sensitivity = useMemo(() => {
    return WACC_VALS.map(w => GROWTH_VALS.map(g => {
      let rev = baseRevenue;
      const rows = [];
      for (let yr = 1; yr <= 10; yr++) {
        const gr = (yr <= 5 ? g : growth610) / 100;
        rev = rev * (1 + gr);
        const fcf = rev * (fcfMargin / 100);
        const df = 1 / Math.pow(1 + w / 100, yr);
        rows.push({ fcf, pvFcf: fcf * df });
      }
      const totalPv = rows.reduce((s, r) => s + r.pvFcf, 0);
      const wRate = w / 100;
      const tRate = termGrowth / 100;
      const tv = rows[9].fcf * (1 + tRate) / (wRate - tRate);
      const pvTv = tv / Math.pow(1 + wRate, 10);
      return (totalPv + pvTv) / SHARES;
    }));
  }, [baseRevenue, growth610, fcfMargin, termGrowth]);

  const maxFcf = Math.max(...calc.rows.map(r => r.fcf));
  const undervalued = calc.mos >= 0;

  // Bar chart dimensions
  const chartW = 800;
  const chartH = 260;
  const padL = 64, padR = 16, padT = 16, padB = 44;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const barGroupW = plotW / 10;
  const barW = barGroupW * 0.38;
  const gridLines = [0, 0.25, 0.5, 0.75, 1.0];

  const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        input[type='range'] { margin: 0; padding: 0; }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: ${C.accent}; cursor: pointer;
          border: 2px solid ${C.bg};
          box-shadow: 0 0 8px rgba(6,182,212,0.5);
        }
        input[type='range']::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: ${C.accent}; cursor: pointer;
          border: 2px solid ${C.bg};
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 3px; }
        .trow:hover td { background: rgba(6,182,212,0.04) !important; }
        .senscell { transition: background 0.15s; }
      `}</style>

      <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: C.mono, padding: '28px 32px' }}>

        {/* ── HEADER ── */}
        <div style={{ borderBottom: `1px solid ${C.border2}`, paddingBottom: '16px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', color: C.accent, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
                DISCOUNTED CASH FLOW VALUATION MODEL
              </div>
              <div style={{ fontSize: '30px', fontWeight: 'bold', lineHeight: 1.1 }}>
                NVIDIA CORPORATION&nbsp;
                <span style={{ color: C.accent }}>NVDA</span>
                <span style={{ fontSize: '12px', color: C.muted, marginLeft: '12px', fontWeight: 'normal' }}>NASDAQ</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '2px', marginBottom: '4px' }}>LAST PRICE</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: C.yellow, lineHeight: 1 }}>${CURRENT_PRICE.toFixed(2)}</div>
              <div style={{ fontSize: '10px', color: C.muted, marginTop: '4px' }}>24.4B shares · {now}</div>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* ── LEFT PANEL ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Inputs */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '10px', color: C.accent, letterSpacing: '2.5px', textTransform: 'uppercase',
                marginBottom: '18px', paddingBottom: '10px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between' }}>
                <span>MODEL INPUTS</span>
                <span style={{ color: C.muted }}>LIVE</span>
              </div>

              <div style={{ fontSize: '9px', color: C.muted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', marginTop: '-6px', color: '#334155' }}>
                ─── GROWTH ASSUMPTIONS ───────────
              </div>
              <SliderInput label="Revenue Growth · Yr 1–5" value={growth15} setValue={setGrowth15} min={0} max={50} step={0.5} unit="%" />
              <SliderInput label="Revenue Growth · Yr 6–10" value={growth610} setValue={setGrowth610} min={0} max={30} step={0.5} unit="%" />

              <div style={{ fontSize: '9px', color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                ─── PROFITABILITY ──────────────────
              </div>
              <SliderInput label="FCF Margin" value={fcfMargin} setValue={setFcfMargin} min={10} max={80} step={0.5} unit="%" />
              <SliderInput label="Base Revenue (FY2025)" value={baseRevenue} setValue={setBaseRevenue} min={20} max={150} step={1} unit="$" />

              <div style={{ fontSize: '9px', color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                ─── DISCOUNT & TERMINAL ────────────
              </div>
              <SliderInput label="Discount Rate (WACC)" value={wacc} setValue={setWacc} min={5} max={20} step={0.1} unit="%" />
              <SliderInput label="Terminal Growth Rate" value={termGrowth} setValue={setTermGrowth} min={1} max={6} step={0.1} unit="%" />
            </div>

            {/* Intrinsic Value */}
            <div style={{
              background: C.surface,
              border: `2px solid ${undervalued ? C.green : C.red}`,
              borderRadius: '10px', padding: '20px', textAlign: 'center',
              boxShadow: undervalued ? `0 0 24px rgba(16,185,129,0.12)` : `0 0 24px rgba(239,68,68,0.12)`,
            }}>
              <div style={{ fontSize: '9px', color: C.muted, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                INTRINSIC VALUE / SHARE
              </div>
              <div style={{ fontSize: '46px', fontWeight: 'bold', color: undervalued ? C.green : C.red, lineHeight: 1 }}>
                ${calc.intrinsic.toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: C.muted, marginTop: '8px' }}>
                vs current&nbsp;
                <span style={{ color: C.yellow }}>${CURRENT_PRICE.toFixed(2)}</span>
              </div>
              <div style={{ height: '1px', background: C.border2, margin: '16px 0' }} />

              <div style={{ fontSize: '9px', color: C.muted, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                MARGIN OF SAFETY
              </div>
              <div style={{
                padding: '12px', borderRadius: '8px',
                background: undervalued ? C.greenDim : C.redDim,
                border: `1px solid ${undervalued ? C.green : C.red}`,
              }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: undervalued ? C.green : C.red, lineHeight: 1 }}>
                  {calc.mos >= 0 ? '+' : ''}{calc.mos.toFixed(1)}%
                </div>
                <div style={{ fontSize: '12px', color: undervalued ? C.green : C.red, marginTop: '6px', letterSpacing: '2px' }}>
                  {undervalued ? '▲  UNDERVALUED' : '▼  OVERVALUED'}
                </div>
              </div>

              <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  ['Spread', `$${(calc.intrinsic - CURRENT_PRICE).toFixed(2)}`],
                  ['Upside', `${(((calc.intrinsic / CURRENT_PRICE) - 1) * 100).toFixed(1)}%`],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: C.surface2, borderRadius: '6px', padding: '8px' }}>
                    <div style={{ fontSize: '9px', color: C.muted, letterSpacing: '1px' }}>{k}</div>
                    <div style={{ fontSize: '14px', color: undervalued ? C.green : C.red, fontWeight: 'bold' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <SummaryCard
                label="Total PV of FCFs"
                value={`$${calc.totalPvFcf.toFixed(1)}B`}
                sub="Sum of discounted FCFs"
              />
              <SummaryCard
                label="Terminal Value"
                value={`$${calc.tv.toFixed(1)}B`}
                sub={`PV: $${calc.pvTv.toFixed(1)}B`}
              />
              <SummaryCard
                label="Enterprise Value"
                value={`$${calc.ev.toFixed(1)}B`}
                sub="PV FCFs + PV Terminal"
                accent
              />
              <SummaryCard
                label="TV as % of EV"
                value={`${(calc.pvTv / calc.ev * 100).toFixed(1)}%`}
                sub={`FCFs: ${(calc.totalPvFcf / calc.ev * 100).toFixed(1)}%`}
              />
            </div>

            {/* 10-Year Table */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: C.accent, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                  10-YEAR FREE CASH FLOW PROJECTION
                </span>
                <span style={{ fontSize: '10px', color: C.muted }}>
                  BASE REV: ${baseRevenue}B · WACC: {wacc}% · TGR: {termGrowth}%
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#0a1220' }}>
                      {[
                        ['YEAR', 'left'],
                        ['GROWTH', 'right'],
                        ['REVENUE ($B)', 'right'],
                        ['FCF ($B)', 'right'],
                        ['DISC. FACTOR', 'right'],
                        ['PV OF FCF ($B)', 'right'],
                        ['CUM. PV ($B)', 'right'],
                      ].map(([h, align]) => (
                        <th key={h} style={{
                          padding: '9px 16px', textAlign: align,
                          color: C.muted, fontWeight: 'normal', fontSize: '9px',
                          letterSpacing: '1.2px', borderBottom: `1px solid ${C.border2}`,
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calc.rows.map((r, i) => {
                      const cumPv = calc.rows.slice(0, i + 1).reduce((s, x) => s + x.pvFcf, 0);
                      const isPhase2 = r.yr > 5;
                      return (
                        <tr key={r.yr} className="trow" style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '9px 16px', color: C.accent, fontFamily: C.mono, whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 'bold' }}>YR {r.yr}</span>
                            {r.yr === 1 && <span style={{ marginLeft: '6px', fontSize: '9px', color: C.muted, background: C.surface2, padding: '1px 5px', borderRadius: '3px' }}>PHASE 1</span>}
                            {r.yr === 6 && <span style={{ marginLeft: '6px', fontSize: '9px', color: C.muted, background: C.surface2, padding: '1px 5px', borderRadius: '3px' }}>PHASE 2</span>}
                          </td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: isPhase2 ? C.muted2 : C.text, fontFamily: C.mono }}>
                            {(r.yr <= 5 ? growth15 : growth610).toFixed(1)}%
                          </td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: C.text, fontFamily: C.mono }}>
                            {r.rev.toFixed(2)}
                          </td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: C.green, fontFamily: C.mono, fontWeight: 'bold' }}>
                            {r.fcf.toFixed(2)}
                          </td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: C.muted2, fontFamily: C.mono }}>
                            {r.df.toFixed(4)}
                          </td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: C.yellow, fontFamily: C.mono, fontWeight: 'bold' }}>
                            {r.pvFcf.toFixed(2)}
                          </td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: C.muted2, fontFamily: C.mono }}>
                            {cumPv.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Totals row */}
                    <tr style={{ background: C.accentDim, borderTop: `1px solid ${C.accent}` }}>
                      <td style={{ padding: '10px 16px', color: C.accent, fontFamily: C.mono, fontWeight: 'bold' }}>TOTAL</td>
                      <td />
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: C.text, fontFamily: C.mono, fontWeight: 'bold' }}>
                        {calc.rows[9].rev.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: C.green, fontFamily: C.mono, fontWeight: 'bold' }}>
                        {calc.rows.reduce((s, r) => s + r.fcf, 0).toFixed(2)}
                      </td>
                      <td />
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: C.yellow, fontFamily: C.mono, fontWeight: 'bold' }}>
                        {calc.totalPvFcf.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: C.yellow, fontFamily: C.mono, fontWeight: 'bold' }}>
                        {calc.totalPvFcf.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bar Chart */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '10px', color: C.accent, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>FCF vs PV OF FCF — 10-YEAR COMPARISON</span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {[['FCF ($B)', C.green], ['PV of FCF ($B)', C.accent]].map(([label, color]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', background: color, borderRadius: '2px' }} />
                      <span style={{ fontSize: '9px', color: C.muted }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block', overflow: 'visible' }}>
                {/* Grid */}
                {gridLines.map(frac => {
                  const y = padT + plotH - frac * plotH;
                  const val = frac * maxFcf;
                  return (
                    <g key={frac}>
                      <line x1={padL} y1={y} x2={padL + plotW} y2={y}
                        stroke={frac === 0 ? C.border2 : C.border} strokeWidth={frac === 0 ? 1.5 : 1} strokeDasharray={frac === 0 ? 'none' : '4,4'} />
                      <text x={padL - 6} y={y + 4} fill={C.muted} fontSize="10" textAnchor="end" fontFamily="monospace">
                        {val.toFixed(0)}
                      </text>
                    </g>
                  );
                })}

                {/* Bars */}
                {calc.rows.map((r, i) => {
                  const groupX = padL + i * barGroupW;
                  const fcfH = (r.fcf / maxFcf) * plotH;
                  const pvH = (r.pvFcf / maxFcf) * plotH;
                  const b1x = groupX + barGroupW * 0.1;
                  const b2x = groupX + barGroupW * 0.52;
                  const baseY = padT + plotH;
                  return (
                    <g key={r.yr}>
                      {/* Phase divider */}
                      {r.yr === 6 && (
                        <line x1={groupX} y1={padT} x2={groupX} y2={padT + plotH}
                          stroke={C.border2} strokeWidth="1" strokeDasharray="3,3" />
                      )}
                      {/* FCF bar */}
                      <rect x={b1x} y={baseY - fcfH} width={barGroupW * 0.38} height={fcfH}
                        fill={C.green} opacity="0.8" rx="2" />
                      {/* PV bar */}
                      <rect x={b2x} y={baseY - pvH} width={barGroupW * 0.38} height={pvH}
                        fill={C.accent} opacity="0.8" rx="2" />
                      {/* Label */}
                      <text x={groupX + barGroupW / 2} y={baseY + 14}
                        fill={r.yr <= 5 ? C.muted2 : C.muted} fontSize="10" textAnchor="middle" fontFamily="monospace">
                        YR{r.yr}
                      </text>
                    </g>
                  );
                })}

                {/* Phase labels */}
                <text x={padL + plotW * 0.25} y={padT + 12} fill={C.muted} fontSize="9" textAnchor="middle" fontFamily="monospace">
                  — PHASE 1 ({growth15}%) —
                </text>
                <text x={padL + plotW * 0.75} y={padT + 12} fill={C.muted} fontSize="9" textAnchor="middle" fontFamily="monospace">
                  — PHASE 2 ({growth610}%) —
                </text>

                {/* Y-axis label */}
                <text x="12" y={padT + plotH / 2} fill={C.muted} fontSize="9" textAnchor="middle" fontFamily="monospace"
                  transform={`rotate(-90, 12, ${padT + plotH / 2})`}>
                  USD BILLIONS
                </text>
              </svg>
            </div>

            {/* Sensitivity Table */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '10px', color: C.accent, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                  SENSITIVITY ANALYSIS — INTRINSIC VALUE PER SHARE ($)
                </div>
                <div style={{ fontSize: '10px', color: C.muted, marginTop: '4px' }}>
                  WACC (rows) × Revenue Growth Yr 1–5 (columns) · Green = undervalued vs ${CURRENT_PRICE} · Active cell highlighted
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#0a1220' }}>
                      <th style={{ padding: '10px 16px', textAlign: 'center', color: C.muted, fontWeight: 'normal',
                        fontSize: '9px', letterSpacing: '1px', borderBottom: `1px solid ${C.border2}`,
                        whiteSpace: 'nowrap', minWidth: '100px' }}>
                        WACC ↓ / GR →
                      </th>
                      {GROWTH_VALS.map(g => (
                        <th key={g} style={{
                          padding: '10px 20px', textAlign: 'center', color: g === growth15 ? C.accent : C.muted,
                          fontWeight: g === growth15 ? 'bold' : 'normal', fontSize: '10px',
                          letterSpacing: '1px', borderBottom: `1px solid ${C.border2}`,
                          background: g === growth15 ? C.accentDim : 'transparent',
                        }}>
                          {g}%
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WACC_VALS.map((w, wi) => (
                      <tr key={w} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{
                          padding: '10px 16px', textAlign: 'center', fontFamily: C.mono, fontWeight: 'bold',
                          color: w === wacc ? C.accent : C.muted2,
                          background: w === wacc ? C.accentDim : 'rgba(6,182,212,0.03)',
                          fontSize: '11px',
                        }}>
                          {w.toFixed(1)}%
                        </td>
                        {sensitivity[wi].map((val, gi) => {
                          const diff = val - CURRENT_PRICE;
                          const isGreen = diff >= 0;
                          const isActive = Math.abs(w - wacc) < 0.01 && GROWTH_VALS[gi] === growth15;
                          const intensity = Math.min(Math.abs(diff) / CURRENT_PRICE, 0.5);
                          return (
                            <td key={gi} className="senscell" style={{
                              padding: '10px 20px', textAlign: 'center', fontFamily: C.mono,
                              fontWeight: isActive ? 'bold' : 'normal',
                              fontSize: isActive ? '13px' : '12.5px',
                              color: isGreen ? C.green : C.red,
                              background: isActive
                                ? `rgba(6,182,212,0.18)`
                                : isGreen
                                  ? `rgba(16,185,129,${intensity * 0.3})`
                                  : `rgba(239,68,68,${intensity * 0.3})`,
                              outline: isActive ? `2px solid ${C.accent}` : 'none',
                              outlineOffset: '-2px',
                            }}>
                              ${val.toFixed(2)}
                              {isActive && (
                                <span style={{ display: 'block', fontSize: '8px', color: C.accent, marginTop: '2px', letterSpacing: '1px' }}>
                                  ACTIVE
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div style={{ fontSize: '9px', color: C.muted, textAlign: 'center', letterSpacing: '1px', paddingTop: '4px', lineHeight: 1.8 }}>
              <span>DCF MODEL · NVIDIA CORPORATION (NVDA) · {now}</span>
              <br />
              <span>ASSUMPTIONS: {SHARES}B SHARES OUTSTANDING · BASE REVENUE ${baseRevenue}B · WACC {wacc}% · TGR {termGrowth}% · FCF MARGIN {fcfMargin}%</span>
              <br />
              <span style={{ color: C.border2 }}>FOR EDUCATIONAL PURPOSES ONLY. NOT FINANCIAL ADVICE.</span>
              <br />
              <span style={{ color: C.muted2 }}>Built by Ayaan Sanghrajka · 2025</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
