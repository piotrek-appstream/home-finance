import { useEffect, useState } from "react";
import type { StoreState } from "@/types";

const KEY = "hh-finance-store-v5"; // schema: { futurePayments, earnings, expenses, savings, plan }, money is {value,currency}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // Try previous version key for backward compatibility
      const prevRawV3 = localStorage.getItem("hh-finance-store-v3");
      const prevRawV2 = localStorage.getItem("hh-finance-store-v2");
      const prevRawV4 = localStorage.getItem("hh-finance-store-v4");
      const prevRaw = prevRawV4 ?? prevRawV3 ?? prevRawV2;
      if (prevRaw) {
        const parsed = JSON.parse(prevRaw);
        // Migrate from older schemas to v5
        const migratedPlan = normalizePlan(parsed.plan);
        return {
          futurePayments: parsed.futurePayments ?? parsed.debts ?? [],
          earnings: parsed.earnings ?? [],
          expenses: (parsed.expenses ?? []).map((x: any) => ({ id: x.id, name: x.name, amount: x.amount })),
          savings: parsed.savings ?? [],
          plan: migratedPlan ?? defaultPlan(),
        };
      }
      return { futurePayments: [], earnings: [], expenses: [], savings: [], plan: defaultPlan() };
    }
    const parsed = JSON.parse(raw);
    return {
      futurePayments: parsed.futurePayments ?? parsed.debts ?? [],
      earnings: parsed.earnings ?? [],
      // Map to current shape in case older data had extra fields (e.g., cadence)
      expenses: (parsed.expenses ?? []).map((x: any) => ({ id: x.id, name: x.name, amount: x.amount })),
      savings: parsed.savings ?? [],
      plan: normalizePlan(parsed.plan),
    };
  } catch {
    return { futurePayments: [], earnings: [], expenses: [], savings: [], plan: defaultPlan() };
  }
}

function save(state: StoreState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function useStore() {
  const [state, setState] = useState<StoreState>(() => load());
  useEffect(() => save(state), [state]);
  return [state, setState] as const;
}

function defaultPlan() {
  return {
    futurePaymentPerMonth: { value: 0, currency: "PLN" as const },
    priority: "dueDate" as const,
    customFuturePaymentOrder: [],
    seedSavingsIds: [],
  };
}

function normalizePlan(p: any) {
  const d = defaultPlan();
  if (!p) return d;
  return {
    futurePaymentPerMonth:
      (p.futurePaymentPerMonth && typeof p.futurePaymentPerMonth.value === "number" && p.futurePaymentPerMonth.currency)
        ? p.futurePaymentPerMonth
        : (p.debtPerMonth && typeof p.debtPerMonth.value === "number" && p.debtPerMonth.currency)
          ? p.debtPerMonth
          : d.futurePaymentPerMonth,
    priority: p.priority === "amount" || p.priority === "custom" || p.priority === "dueDate" ? p.priority : d.priority,
    customFuturePaymentOrder: Array.isArray(p.customFuturePaymentOrder)
      ? p.customFuturePaymentOrder
      : Array.isArray(p.customDebtOrder)
        ? p.customDebtOrder
        : d.customFuturePaymentOrder,
    seedSavingsIds: Array.isArray(p.seedSavingsIds) ? p.seedSavingsIds : d.seedSavingsIds,
  } as const;
}
