import type { Plan, StoreState } from "@/types";

const KEY_CURRENT = "hh-finance-store-v5";
const LEGACY_KEYS = ["hh-finance-store-v4", "hh-finance-store-v3", "hh-finance-store-v2"] as const;

export function defaultPlan(): Plan {
  return {
    futurePaymentPerMonth: { value: 0, currency: "PLN" },
    priority: "dueDate",
    customFuturePaymentOrder: [],
    seedSavingsIds: [],
  };
}

export function normalizePlan(p: any): Plan {
  const d = defaultPlan();
  if (!p) return d;
  return {
    futurePaymentPerMonth:
      p?.futurePaymentPerMonth && typeof p.futurePaymentPerMonth.value === "number" && p.futurePaymentPerMonth.currency
        ? p.futurePaymentPerMonth
        : p?.debtPerMonth && typeof p.debtPerMonth.value === "number" && p.debtPerMonth.currency
          ? p.debtPerMonth
          : d.futurePaymentPerMonth,
    priority: p?.priority === "amount" || p?.priority === "custom" || p?.priority === "dueDate" ? p.priority : d.priority,
    customFuturePaymentOrder: Array.isArray(p?.customFuturePaymentOrder)
      ? p.customFuturePaymentOrder
      : Array.isArray(p?.customDebtOrder)
        ? p.customDebtOrder
        : d.customFuturePaymentOrder,
    seedSavingsIds: Array.isArray(p?.seedSavingsIds) ? p.seedSavingsIds : d.seedSavingsIds,
  };
}

export function loadStore(): StoreState {
  try {
    const raw = localStorage.getItem(KEY_CURRENT);
    if (!raw) {
      const legacyRaw = LEGACY_KEYS.map((k) => localStorage.getItem(k)).find(Boolean);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw as string);
        return {
          futurePayments: parsed.futurePayments ?? parsed.debts ?? [],
          earnings: parsed.earnings ?? [],
          expenses: (parsed.expenses ?? []).map((x: any) => ({ id: x.id, name: x.name, amount: x.amount })),
          savings: parsed.savings ?? [],
          plan: normalizePlan(parsed.plan),
        };
      }
      return { futurePayments: [], earnings: [], expenses: [], savings: [], plan: defaultPlan() };
    }
    const parsed = JSON.parse(raw);
    return {
      futurePayments: parsed.futurePayments ?? parsed.debts ?? [],
      earnings: parsed.earnings ?? [],
      expenses: (parsed.expenses ?? []).map((x: any) => ({ id: x.id, name: x.name, amount: x.amount })),
      savings: parsed.savings ?? [],
      plan: normalizePlan(parsed.plan),
    };
  } catch {
    return { futurePayments: [], earnings: [], expenses: [], savings: [], plan: defaultPlan() };
  }
}

export function saveStore(state: StoreState) {
  localStorage.setItem(KEY_CURRENT, JSON.stringify(state));
}

