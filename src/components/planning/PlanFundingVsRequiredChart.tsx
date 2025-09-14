import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Line, CartesianGrid } from "recharts";
import type { Currency, StoreState } from "@/types";
import type { PlanSimResult } from "@/utils/planning";
import { totalInCurrency } from "@/utils/fx";

export function PlanFundingVsRequiredChart({ state, planSim, displayCurrency, horizonMonths }: { state: StoreState; planSim: PlanSimResult; displayCurrency: Currency; horizonMonths?: number }) {
  const now = new Date();
  const seed = totalInCurrency(
    state.savings.filter((s) => state.plan.seedSavingsIds.includes(s.id)).map((s) => s.amount),
    displayCurrency,
  ).value;
  const perMonth = Math.max(0, (planSim.monthlyBudget.value || 0) - (planSim.remainingAfterAlloc.value || 0));

  // Map due months to required sums
  const dueIdxs = planSim.futurePayments.map((fp) => monthsBetween(now, fp.dueDate));
  const maxDue = dueIdxs.length ? Math.max(...dueIdxs) : 0;
  const defaultHorizon = Math.max(0, maxDue) + 12; // show a year past last due
  const horizon = Math.max(0, (horizonMonths ?? defaultHorizon));

  const requiredByIdx = new Map<number, number>();
  planSim.futurePayments.forEach((fp, i) => {
    const idx = Math.max(0, dueIdxs[i]);
    requiredByIdx.set(idx, (requiredByIdx.get(idx) || 0) + (fp.amount.value || 0));
  });

  let cumulativeRequired = 0;
  const data = Array.from({ length: horizon + 1 }).map((_, i) => {
    cumulativeRequired += requiredByIdx.get(i) || 0;
    const available = Math.max(0, seed + perMonth * i);
    return { ym: formatYm(addMonths(now, i)), required: round(cumulativeRequired), available: round(available) };
  });

  return (
    <div className="w-full" style={{ height: 280 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ym" interval="preserveStartEnd" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => formatThousands(v)} width={60} />
          <Tooltip formatter={(v: any) => formatValue(v, displayCurrency)} />
          <Legend />
          <Line type="monotone" dataKey="required" name="Required (cumulative)" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="available" name="Available (seed + monthly)" stroke="#10b981" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function monthsBetween(base: Date, dateIso: string): number {
  const [y, m] = dateIso.slice(0, 7).split("-").map(Number);
  return (y - base.getFullYear()) * 12 + (m - 1 - base.getMonth());
}
function addMonths(base: Date, add: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + add, 1);
}
function formatYm(d: Date): string {
  return d.toISOString().slice(0, 7);
}
function round(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }
function formatValue(v: any, currency: Currency) {
  const n = Number(v) || 0;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

function formatThousands(v: number): string {
  const n = Number(v) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return `${Math.round(n)}`;
}
