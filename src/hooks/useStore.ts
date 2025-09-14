import { useEffect, useState } from "react";
import type { StoreState } from "@/types";

const KEY = "hh-finance-store-v3"; // schema: { debts, earnings, expenses, savings }, money is {value,currency}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // Try previous version key for backward compatibility
      const prevRaw = localStorage.getItem("hh-finance-store-v2");
      if (prevRaw) {
        const parsed = JSON.parse(prevRaw);
        return {
          debts: parsed.debts ?? [],
          earnings: parsed.earnings ?? [],
          expenses: (parsed.expenses ?? []).map((x: any) => ({ id: x.id, name: x.name, amount: x.amount })),
          savings: parsed.savings ?? [],
        };
      }
      return { debts: [], earnings: [], expenses: [], savings: [] };
    }
    const parsed = JSON.parse(raw);
    return {
      debts: parsed.debts ?? [],
      earnings: parsed.earnings ?? [],
      // Map to current shape in case older data had extra fields (e.g., cadence)
      expenses: (parsed.expenses ?? []).map((x: any) => ({ id: x.id, name: x.name, amount: x.amount })),
      savings: parsed.savings ?? [],
    };
  } catch {
    return { debts: [], earnings: [], expenses: [], savings: [] };
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
