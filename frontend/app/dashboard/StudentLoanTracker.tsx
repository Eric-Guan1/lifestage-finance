"use client";

import { useMemo, useState, useEffect, useRef } from "react";

type Point = { month: number; balance: number; interest: number; principal: number };

function currency(v: number) {
  return v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function computeSchedule(principal: number, annualRate: number, monthlyPayment: number, maxMonths = 6000) {
  const monthlyRate = annualRate / 12 / 100;
  const points: Point[] = [];
  let balance = principal;
  let month = 0;
  let totalInterest = 0;
  let totalPrincipal = 0;

  if (monthlyPayment <= balance * monthlyRate) {
    // Payment too small to ever pay down principal
    return { points, totalInterest: 0, totalPrincipal: 0, error: "Monthly payment is too small to cover interest — increase payment or choose a shorter term." };
  }

  while (balance > 0 && month < maxMonths) {
    month += 1;
    const interest = balance * monthlyRate;
    let principalPaid = monthlyPayment - interest;
    if (principalPaid > balance) principalPaid = balance;
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    totalPrincipal += principalPaid;
    points.push({ month, balance, interest, principal: principalPaid });
  }

  return { points, totalInterest, totalPrincipal, error: null };
}

export default function StudentLoanTracker() {
  const [principal, setPrincipal] = useState<number>(20000);
  const [annualRate, setAnnualRate] = useState<number>(5.5);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(250);
  const [monthsToPayoff, setMonthsToPayoff] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);

  const STORAGE_KEY = "studentloan_tracker_settings";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.principal === "number") setPrincipal(s.principal);
        if (typeof s.annualRate === "number") setAnnualRate(s.annualRate);
        if (typeof s.monthlyPayment === "number") setMonthlyPayment(s.monthlyPayment);
        if (s.monthsToPayoff === null || typeof s.monthsToPayoff === "number") setMonthsToPayoff(s.monthsToPayoff);
        const valid = (s.principal > 0) && ((s.monthlyPayment > 0) || (s.monthsToPayoff && s.monthsToPayoff > 0));
        setHasSettings(Boolean(valid));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const saveSettings = () => {
    if (typeof window === "undefined") return;
    const s = { principal, annualRate, monthlyPayment, monthsToPayoff };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    const valid = (principal > 0) && ((monthlyPayment > 0) || (monthsToPayoff && monthsToPayoff > 0));
    setHasSettings(Boolean(valid));
    setEditMode(false);
  };

  const cancelEdit = () => {
    // reload from storage to revert unsaved changes
    if (typeof window === "undefined") return setEditMode(false);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw);
        if (typeof s.principal === "number") setPrincipal(s.principal);
        if (typeof s.annualRate === "number") setAnnualRate(s.annualRate);
        if (typeof s.monthlyPayment === "number") setMonthlyPayment(s.monthlyPayment);
        if (s.monthsToPayoff === null || typeof s.monthsToPayoff === "number") setMonthsToPayoff(s.monthsToPayoff);
      } catch (e) {
        // ignore
      }
    }
    setEditMode(false);
  };

  const result = useMemo(() => {
    // If monthsToPayoff provided, compute monthly payment instead
    let payment = monthlyPayment;
    if (monthsToPayoff && monthsToPayoff > 0) {
      const r = annualRate / 12 / 100;
      if (r === 0) payment = principal / monthsToPayoff;
      else {
        const numerator = r * Math.pow(1 + r, monthsToPayoff);
        const denom = Math.pow(1 + r, monthsToPayoff) - 1;
        payment = principal * (numerator / denom);
      }
    }
    return computeSchedule(principal, annualRate, payment);
  }, [principal, annualRate, monthlyPayment, monthsToPayoff]);

  const maxMonths = result.points.length || 1;

  // Prepare data for line chart (sample to at most 200 points)
  const linePoints = useMemo(() => {
  if (!result.points.length) return [] as { x: number; y: number }[];
  const step = Math.max(1, Math.ceil(result.points.length / 200));
  const sampled = result.points.filter((_, i) => i % step === 0).map(p => ({ x: p.month, y: p.balance }));
  // Ensure the chart always includes a starting point at month = 0 with the current principal
  // (computeSchedule records months starting at 1). This guarantees the x-axis begins at 0
  // and keeps tick generation stable even while the user is editing inputs.
  if (sampled.length === 0) return [{ x: 0, y: principal }];
  if (sampled[0].x > 0) sampled.unshift({ x: 0, y: principal });
  else sampled[0] = { x: 0, y: principal };
  return sampled;
  }, [result.points]);

  const totalPaid = (result.totalInterest || 0) + (result.totalPrincipal || 0);
  const interestPercent = totalPaid > 0 ? (result.totalInterest! / totalPaid) * 100 : 0;

  const svgViewH = editMode ? 84 : 112;
  const svgViewW = 180; // wider viewBox so chart can be wider while leaving room for labels
  const svgViewBox = `0 0 ${svgViewW} ${svgViewH}`;
  const chartContainerHeightClass = editMode ? "h-80" : "h-[28rem]";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  function formatShort(v: number) {
    if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(v % 1_000_000 ? 1 : 0)}M`;
    if (Math.abs(v) >= 1000) return `$${Math.round(v / 1000)}k`;
    return `$${v}`;
  }

  function formatDuration(months: number) {
    if (!months || months <= 0) return '0 months';
    const yrs = Math.floor(months / 12);
    const rem = months % 12;
    if (yrs === 0) return `${months} months`;
    if (rem === 0) return `${yrs}y (${months} mo)`;
    return `${yrs}y ${rem}m (${months} mo)`;
  }

  function niceYTicks(maxY: number, count = 5) {
    if (!isFinite(maxY) || maxY <= 0) return [0];
    const exponent = Math.floor(Math.log10(maxY));
    const base = Math.pow(10, exponent);
    const candidates = [1, 2, 5, 10];
    let step = base;
    for (const c of candidates) {
      const s = c * Math.pow(10, exponent - Math.floor(Math.log10(c)));
      if (Math.ceil(maxY / s) <= count) {
        step = s;
        break;
      }
    }
    // fallback step
    if (!step) step = Math.ceil(maxY / count);
    const ticks = [];
    const maxTick = Math.ceil(maxY / step) * step;
    for (let v = 0; v <= maxTick; v += step) ticks.push(v);
    return ticks;
  }

  // chart mapping helpers (available to handlers)
  const finalMonth = linePoints.length ? linePoints[linePoints.length - 1].x : 1;
  const maxY = linePoints.length ? Math.max(...linePoints.map(p => p.y)) : principal;
  const minY = 0;
  const paddingLeft = editMode ? 8 : 6;
  const paddingRight = 2;
  const paddingTop = 6;
  const paddingBottom = editMode ? 14 : 18;
  const viewW = svgViewW;
  const viewH = svgViewH;
  const chartW = viewW - paddingLeft - paddingRight;
  const chartH = viewH - paddingTop - paddingBottom;
  // return numeric SVG viewBox coordinates (not formatted strings) so handlers can reuse them
  const toX = (mx: number) => paddingLeft + (mx / Math.max(1, finalMonth)) * chartW;
  const toY = (val: number) => paddingTop + (1 - (val - minY) / Math.max(1, maxY - minY)) * chartH;

  return (
    <section className="mt-6 bg-white shadow rounded-md p-6">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-semibold">Student Loan Tracker</h2>
        <div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="inline-block rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveSettings}
                className="inline-block rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="inline-block rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* If user hasn't provided settings, prompt them to edit first */}
      {!hasSettings && !editMode && (
        <div className="mt-6 text-center text-gray-600">
          <p className="mb-3">No loan details provided. Click "Edit" to enter your loan information to enable the visualization.</p>
        </div>
      )}

      <div className={editMode ? "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" : "mt-4"}>
        {editMode && (
          <div className="space-y-3">
            <label className="block text-sm text-gray-600">Current balance</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full rounded border px-3 py-2"
              min={0}
            />

            <label className="block text-sm text-gray-600">Annual interest rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full rounded border px-3 py-2"
              min={0}
            />

            <label className="block text-sm text-gray-600">Monthly payment (leave blank to use payoff months)</label>
            <input
              type="number"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(Number(e.target.value))}
              className="w-full rounded border px-3 py-2"
              min={0}
            />

            <label className="block text-sm text-gray-600">Or target payoff months (optional)</label>
            <input
              type="number"
              value={monthsToPayoff ?? ""}
              onChange={(e) => setMonthsToPayoff(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded border px-3 py-2"
              min={1}
            />

            <div className="mt-3">
              <p className="text-sm text-gray-700">Estimated months to payoff: <strong>{result.points.length || 0}</strong></p>
              <p className="text-sm text-gray-700">Estimated total interest: <strong>{currency(result.totalInterest || 0)}</strong></p>
              <p className="text-sm text-gray-700">Estimated total paid: <strong>{currency(totalPaid)}</strong></p>
            </div>
          </div>
        )}

        {/* Visualization area - occupies whole box when not editing */}
        <div className={editMode ? "space-y-4" : "mt-4 space-y-4"}>
          <div className={`w-full ${chartContainerHeightClass} bg-gray-50 rounded border p-3 pb-6`}> 
            <div className="text-sm text-gray-600 mb-2">Balance over time</div>
            <div className="text-xs text-gray-500 mb-2">Time to payoff: <span className="text-sm font-medium">{formatDuration(result.points.length || 0)}</span></div>
            {(!hasSettings && !editMode) ? (
              <div className="flex h-full items-center justify-center text-gray-500">Enter your loan details to view the visualization.</div>
            ) : result.error ? (
              <p className="text-sm text-red-500">{result.error}</p>
            ) : (
              <svg
                ref={svgRef}
                viewBox={svgViewBox}
                className="w-full h-full"
              >

                {linePoints.length > 1 && (() => {
                  const finalMonth = linePoints[linePoints.length - 1].x || 1;
                  const maxY = Math.max(...linePoints.map(p => p.y));
                  const minY = 0; // balances won't go below 0

                  // chart area with padding to leave space for labels
                  const paddingLeft = editMode ? 8 : 6; // smaller so chart is wider when not editing
                  const paddingRight = 2;
                  const paddingTop = 6;
                  const paddingBottom = editMode ? 14 : 18; // leave room for x labels inside the SVG (match outer padding)
                  const viewW = svgViewW;
                  const viewH = svgViewH;
                  const chartW = viewW - paddingLeft - paddingRight;
                  const chartH = viewH - paddingTop - paddingBottom;

                  const toX = (mx: number) => (paddingLeft + (mx / Math.max(1, finalMonth)) * chartW).toFixed(2);
                  const toY = (val: number) => (paddingTop + (1 - (val - minY) / Math.max(1, maxY - minY)) * chartH).toFixed(2);

                  const path = linePoints.map((p, i) => {
                    const x = toX(p.x);
                    const y = toY(p.y);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');

                  // ticks: use nicer round numbers for y
                  const rawMaxY = maxY;
                  const yTickValues = niceYTicks(rawMaxY, 5);
                  const yTicks = yTickValues.map(v => ({ y: toY(v), label: formatShort(v) }));

                  // x-axis: either months (6-month ticks) for short payoffs, or years otherwise
                  const totalMonths = Math.max(1, Math.ceil(finalMonth));
                  let xTicks: { x: number | string; label: string }[] = [];
                  let xAxisLabel = 'Years';
                  if (totalMonths < 60) {
                    // show months with consistent 6-month tick intervals
                    const stepMonths = 6;
                    // round axis end up to nearest 6-month multiple so ticks stay uniform (0,6,12,...)
                    const maxTick = Math.max(stepMonths, Math.ceil(totalMonths / stepMonths) * stepMonths);
                    const monthTicks: number[] = [];
                    for (let m = 0; m <= maxTick; m += stepMonths) monthTicks.push(m);
                    xTicks = monthTicks.map((m) => ({ x: toX(m), label: `${m}` }));
                    xAxisLabel = 'Months';
                  } else {
                    const totalYears = Math.max(1, Math.ceil(finalMonth / 12));
                    const xYearTicks: number[] = [];
                    if (totalYears <= 5) {
                      for (let y = 0; y <= totalYears; y++) xYearTicks.push(y);
                    } else {
                      const steps = 4; // target ~5 ticks
                      const step = Math.ceil(totalYears / steps);
                      for (let y = 0; y <= totalYears; y += step) xYearTicks.push(y);
                      if (xYearTicks[xYearTicks.length - 1] !== totalYears) xYearTicks.push(totalYears);
                    }
                    xTicks = xYearTicks.map((y) => ({ x: toX(y * 12), label: `${y}` }));
                    xAxisLabel = 'Years';
                  }

                  const xAxisEndStr = xTicks.length ? String(xTicks[xTicks.length - 1].x) : (paddingLeft + chartW).toFixed(2);
                  return (
                    <g>
                      {/* horizontal grid lines across chart area */}
                      {yTicks.map((t, i) => (
                        <line key={`grid-${i}`} x1={paddingLeft} y1={t.y} x2={paddingLeft + chartW} y2={t.y} stroke="#e5e7eb" strokeWidth={0.6} />
                      ))}

                      {/* y ticks & labels */}
                      {yTicks.map((t, i) => (
                        <g key={`yt-${i}`}>
                          <line x1={paddingLeft - 4} y1={t.y} x2={paddingLeft} y2={t.y} stroke="#d1d5db" strokeWidth={0.6} />
                          <text x={paddingLeft - 6} y={Number(t.y) + 3} fontSize={4} fill="#374151" textAnchor="end">{t.label}</text>
                        </g>
                      ))}

                      {/* y axis title (rotated) moved further left to avoid overlapping ticks */}
                      <text x={paddingLeft - 22} y={paddingTop + chartH / 2} fontSize={3.5} fill="#374151" textAnchor="middle" transform={`rotate(-90 ${paddingLeft - 22} ${paddingTop + chartH / 2})`}>Balance (USD)</text>

                      {/* line path (data) */}
                      <path d={path} fill="none" stroke="#3b82f6" strokeWidth={0.8} />

                      {/* axes drawn after the data so axis color remains consistent */}
                      <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={paddingTop + chartH} stroke="#9ca3af" strokeWidth={0.8} />
                      <line x1={paddingLeft} y1={paddingTop + chartH} x2={xAxisEndStr} y2={paddingTop + chartH} stroke="#9ca3af" strokeWidth={0.8} />

            {/* x ticks & labels (placed inside the chart area) */}
          {xTicks.map((t, i) => (
                        <g key={`xt-${i}`}>
                          <line x1={t.x} y1={paddingTop + chartH} x2={t.x} y2={paddingTop + chartH + 3} stroke="#ddd" strokeWidth={0.4} />
        <text x={t.x} y={Math.min(viewH - 4, paddingTop + chartH + 4)} fontSize={3.75} fill="#374151" textAnchor="middle">{t.label}</text>
                        </g>
                      ))}

            {/* x axis title */}
            <text x={paddingLeft + chartW / 2} y={Math.min(viewH - 2, paddingTop + chartH + 8)} fontSize={3.5} fill="#444" textAnchor="middle">{xAxisLabel}</text>

                      {/* tooltip removed: static axes-only chart */}
                    </g>
                  );
                })()}
              </svg>
            )}
          </div>

          {/* Donut chart - interest vs principal */}
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 relative">
              <svg viewBox="0 0 36 36" className="w-28 h-28">
                <path d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831" fill="#f3f4f6" />
                {/* interest slice */}
                <circle r="15.9155" cx="18" cy="18" fill="transparent" stroke="#ef4444" strokeWidth="4"
                  strokeDasharray={`${interestPercent} ${100 - interestPercent}`} strokeDashoffset="25" transform="rotate(-90 18 18)" />
                {/* cutout */}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Interest</div>
                  <div className="text-sm text-red-600">{interestPercent.toFixed(0)}%</div>
                </div>
              </div>
            </div>

              <div>
              <div className="text-base font-semibold text-gray-700 mb-2">Breakdown</div>
              <div className="mt-2 text-sm space-y-2">
                <div className="grid items-center" style={{ gridTemplateColumns: 'auto 1fr', columnGap: '0.75rem' }}>
                  <div className="text-gray-700">Principal paid:</div>
                  <div className="font-medium text-right whitespace-nowrap">{currency(result.totalPrincipal || 0)}</div>
                </div>

                <div className="grid items-center" style={{ gridTemplateColumns: 'auto 1fr', columnGap: '0.75rem' }}>
                  <div className="text-gray-700">Interest paid:</div>
                  <div className="text-right whitespace-nowrap">{currency(result.totalInterest || 0)}</div>
                </div>

                <div className="grid items-center mt-2" style={{ gridTemplateColumns: 'auto 1fr', columnGap: '0.75rem' }}>
                  <div className="font-semibold">Total:</div>
                  <div className="font-semibold text-right whitespace-nowrap">{currency(totalPaid)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
