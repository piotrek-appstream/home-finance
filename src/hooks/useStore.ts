import { useEffect, useState } from "react";
import type { StoreState } from "@/types";

const KEY = "hh-finance-store-v4"; // schema: { debts, earnings, expenses, savings, plan }, money is {value,currency}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // Try previous version key for backward compatibility
      const prevRawV3 = localStorage.getItem("hh-finance-store-v3");
      const prevRawV2 = localStorage.getItem("hh-finance-store-v2");
      const prevRaw = prevRawV3 ?? prevRawV2;
      if (prevRaw) {
        const parsed = JSON.parse(prevRaw);
        return {
          debts: parsed.debts ?? [],
          earnings: parsed.earnings ?? [],
          expenses: (parsed.expenses ?? []).map((x: any) => ({ id: x.id, name: x.name, amount: x.amount })),
          savings: parsed.savings ?? [],
          plan: defaultPlan(),
        };
      }
      return { debts: [], earnings: [], expenses: [], savings: [], plan: defaultPlan() };
    }
    const parsed = JSON.parse(raw);
    return {
      debts: parsed.debts ?? [],
      earnings: parsed.earnings ?? [],
      // Map to current shape in case older data had extra fields (e.g., cadence)
      expenses: (parsed.expenses ?? []).map((x: any) => ({ id: x.id, name: x.name, amount: x.amount })),
      savings: parsed.savings ?? [],
      plan: normalizePlan(parsed.plan),
    };
  } catch {
    return { debts: [], earnings: [], expenses: [], savings: [], plan: defaultPlan() };
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
    debtPerMonth: { value: 0, currency: "PLN" as const },
    priority: "dueDate" as const,
    customDebtOrder: [],
    seedSavingsIds: [],
  };
}

function normalizePlan(p: any) {
  const d = defaultPlan();
  if (!p) return d;
  return {
    debtPerMonth: p.debtPerMonth && typeof p.debtPerMonth.value === "number" && p.debtPerMonth.currency ? p.debtPerMonth : d.debtPerMonth,
    priority: p.priority === "amount" || p.priority === "custom" || p.priority === "dueDate" ? p.priority : d.priority,
    customDebtOrder: Array.isArray(p.customDebtOrder) ? p.customDebtOrder : d.customDebtOrder,
    seedSavingsIds: Array.isArray(p.seedSavingsIds) ? p.seedSavingsIds : d.seedSavingsIds,
  } as const;
}
