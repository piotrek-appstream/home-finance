import type { Currency, Money, Plan, StoreState } from "@/types";
import { convertMoney, FX_RATES_PLN, totalInCurrency } from "@/utils/fx";

export type DebtSim = {
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
  debts: DebtSim[];
  onTimeCount: number;
  totalDebts: number;
};

export function simulatePlan(
  store: StoreState,
  plan: Plan,
  displayCurrency: Currency,
): PlanSimResult {
  const rates = FX_RATES_PLN;

  const earnings = totalInCurrency(store.earnings.map((e) => e.amount), displayCurrency, rates);
  const expenses = totalInCurrency(store.expenses.map((x) => x.amount), displayCurrency, rates);
  const monthlyBudget: Money = { currency: displayCurrency, value: (earnings.value || 0) - (expenses.value || 0) };

  const debtPerMonth = convertMoney(plan.debtPerMonth, displayCurrency, rates);
  const totalAlloc = (debtPerMonth.value || 0);
  const remainingAfterAlloc: Money = { currency: displayCurrency, value: (monthlyBudget.value || 0) - totalAlloc };

  // Seed amount from selected savings
  const seedValue = store.savings
    .filter((s) => plan.seedSavingsIds.includes(s.id))
    .reduce((sum, s) => sum + convertMoney(s.amount, displayCurrency, rates).value, 0);

  // Prepare debts sorted by priority
  const debts = [...store.debts].sort((a, b) => {
    if (plan.priority === "amount") return (a.amount.value * rates[a.amount.currency]) - (b.amount.value * rates[b.amount.currency]);
    if (plan.priority === "custom" && plan.customDebtOrder && plan.customDebtOrder.length) {
      const ia = plan.customDebtOrder.indexOf(a.id);
      const ib = plan.customDebtOrder.indexOf(b.id);
      if (ia !== -1 && ib !== -1) return ia - ib;
    }
    // default: by due date
    return a.dueDate.localeCompare(b.dueDate);
  });
  // Convert amounts and prepare cumulative sums
  const debtAmounts = debts.map((d) => convertMoney(d.amount, displayCurrency, rates).value);
  const cumSums: number[] = [];
  debts.forEach((_d, i) => {
    const prev = i === 0 ? 0 : cumSums[i - 1];
    cumSums[i] = prev + debtAmounts[i];
  });

  // Current month basis
  const now = new Date();
  const startYear = now.getFullYear();
  const startMonth = now.getMonth(); // 0-based

  function addMonths(ym: { y: number; m0: number }, add: number): string {
    const d = new Date(ym.y, ym.m0 + add, 1);
    return d.toISOString().slice(0, 7);
  }

  function monthsBetweenNow(dateIso: string): number {
    const [y, m] = dateIso.split("-").map(Number);
    return (y - startYear) * 12 + (m - 1 - startMonth);
  }

  const results: DebtSim[] = debts.map((d, idx) => {
    const cumulative = cumSums[idx];
    const sumPrior = idx === 0 ? 0 : cumSums[idx - 1];
    const A = Math.max(0, debtPerMonth.value || 0);
    const S = Math.max(0, seedValue);

    // Months needed to fully fund up to this debt
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
      shortfall = Math.max(0, debtAmounts[idx] - availableForThis);
    }

    return {
      id: d.id,
      name: d.name,
      dueDate: d.dueDate,
      amount: { currency: displayCurrency, value: debtAmounts[idx] },
      fundedBy,
      onTime,
      shortfallAtDueDate: { currency: displayCurrency, value: shortfall },
    } as DebtSim;
  });

  const onTimeCount = results.filter((r) => r.onTime).length;
  return { monthlyBudget, remainingAfterAlloc, debts: results, onTimeCount, totalDebts: results.length };
}
