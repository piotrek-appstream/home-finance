import type { Currency, Money, Plan, StoreState } from "@/types";
import { convertMoney, FX_RATES_PLN, totalInCurrency } from "@/utils/fx";
import { addMonths as addMonthsDate, monthsBetween } from "@/utils/date";

export type FuturePaymentSim = {
  id: string;
  name: string;
  dueDate: string; // ISO yyyy-mm-dd
  amount: Money; // in display currency
  fundedBy: string | null; // ISO YYYY-MM of funding completion relative to current month
  onTime: boolean;
  shortfallAtDueDate: Money; // in display currency (0 if on time)
};

export type PlanSimResult = {
  monthlyBudget: Money;
  remainingAfterAlloc: Money;
  futurePayments: FuturePaymentSim[];
  onTimeCount: number;
  totalFuturePayments: number;
};

export function simulatePlan(
  store: StoreState,
  plan: Plan,
  displayCurrency: Currency,
  horizonMonths: number = 60,
): PlanSimResult {
  const rates = FX_RATES_PLN;

  const earnings = totalInCurrency(store.earnings.map((e) => e.amount), displayCurrency, rates);
  const expenses = totalInCurrency(store.expenses.map((x) => x.amount), displayCurrency, rates);
  const monthlyBudget: Money = { currency: displayCurrency, value: (earnings.value || 0) - (expenses.value || 0) };

  const futurePaymentPerMonth = convertMoney(plan.futurePaymentPerMonth, displayCurrency, rates);
  const totalAlloc = (futurePaymentPerMonth.value || 0);
  const remainingAfterAlloc: Money = { currency: displayCurrency, value: (monthlyBudget.value || 0) - totalAlloc };

  // Seed amount from selected savings
  const seedValue = store.savings
    .filter((s) => plan.seedSavingsIds.includes(s.id))
    .reduce((sum, s) => sum + convertMoney(s.amount, displayCurrency, rates).value, 0);

  // Expand recurring future payments within the horizon and sort by priority
  const now = new Date();
  const expanded = expandFuturePayments(store, horizonMonths);
  const futurePayments = expanded.sort((a, b) => {
    if (plan.priority === "amount") return (a.amount.value * rates[a.amount.currency]) - (b.amount.value * rates[b.amount.currency]);
    if (plan.priority === "custom" && plan.customFuturePaymentOrder && plan.customFuturePaymentOrder.length) {
      const ia = plan.customFuturePaymentOrder.indexOf(a.id.split("#")[0]);
      const ib = plan.customFuturePaymentOrder.indexOf(b.id.split("#")[0]);
      if (ia !== -1 && ib !== -1) return ia - ib;
    }
    // default: by due date
    return a.dueDate.localeCompare(b.dueDate);
  });
  // Convert amounts and prepare cumulative sums
  const fpAmounts = futurePayments.map((d) => convertMoney(d.amount, displayCurrency, rates).value);
  const cumSums: number[] = [];
  futurePayments.forEach((_d, i) => {
    const prev = i === 0 ? 0 : cumSums[i - 1];
    cumSums[i] = prev + fpAmounts[i];
  });

  // Current month basis
  const startYear = now.getFullYear();
  const startMonth = now.getMonth(); // 0-based

  function addMonths(ym: { y: number; m0: number }, add: number): string {
    const d = new Date(ym.y, ym.m0 + add, 1);
    return addMonthsDate(d, 0).toISOString().slice(0, 7);
  }

  function monthsBetweenNow(dateIso: string): number {
    const [y, m] = dateIso.split("-").map(Number);
    return (y - startYear) * 12 + (m - 1 - startMonth);
  }

  const results: FuturePaymentSim[] = futurePayments.map((d, idx) => {
    const cumulative = cumSums[idx];
    const sumPrior = idx === 0 ? 0 : cumSums[idx - 1];
    const A = Math.max(0, futurePaymentPerMonth.value || 0);
    const S = Math.max(0, seedValue);

    // Months needed to fully fund up to this future payment
    let monthsNeeded: number | null;
    if (cumulative <= S) monthsNeeded = 0;
    else if (A <= 0) monthsNeeded = null; // never without monthly allocation
    else monthsNeeded = Math.ceil((cumulative - S) / A);

    const fundedBy = monthsNeeded === null ? null : addMonths({ y: startYear, m0: startMonth }, monthsNeeded);

    // Due date index relative to now
    const dueIdx = monthsBetweenNow(d.dueDate);
    const onTime = monthsNeeded !== null && monthsNeeded <= dueIdx;

    // Shortfall at due date
    let shortfall = 0;
    if (!onTime) {
      const m = Math.max(0, dueIdx);
      const fundsByDue = S + A * m; // assume no funds available before now
      const availableForThis = Math.max(0, fundsByDue - sumPrior);
      shortfall = Math.max(0, fpAmounts[idx] - availableForThis);
    }

    return {
      id: d.id,
      name: d.name,
      dueDate: d.dueDate,
      amount: { currency: displayCurrency, value: fpAmounts[idx] },
      fundedBy,
      onTime,
      shortfallAtDueDate: { currency: displayCurrency, value: shortfall },
    } as FuturePaymentSim;
  });

  const onTimeCount = results.filter((r) => r.onTime).length;
  return { monthlyBudget, remainingAfterAlloc, futurePayments: results, onTimeCount, totalFuturePayments: results.length };
}

// Expand recurring items into concrete due dates within the given horizon from now.
function expandFuturePayments(store: StoreState, horizonMonths: number) {
  const now = new Date();
  const items = [] as { id: string; name: string; amount: Money; dueDate: string }[];
  for (const d of store.futurePayments) {
    const recur = d.recurrence ?? "once";
    if (recur === "once") {
      const diff = monthsBetween(now, d.dueDate);
      if (diff >= 0 && diff <= horizonMonths) items.push({ id: d.id, name: d.name, amount: d.amount, dueDate: d.dueDate });
      continue;
    }
    if (recur === "yearly") {
      const parts = d.dueDate.split("-").map(Number);
      const m0 = parts[1];
      const day = parts[2];
      const startYear = now.getFullYear();
      const years = Math.ceil(horizonMonths / 12) + 1;
      for (let k = -1; k <= years; k++) {
        const y = startYear + k;
        const dt = new Date(y, m0 - 1, day);
        const iso = dt.toISOString().slice(0, 10);
        const diff = monthsBetween(now, iso);
        if (diff >= 0 && diff <= horizonMonths) {
          items.push({ id: `${d.id}#${iso.slice(0,7)}`, name: d.name, amount: d.amount, dueDate: iso });
        }
      }
    }
  }
  return items;
}
