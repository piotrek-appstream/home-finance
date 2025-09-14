import { useEffect, useState } from "react";
import type { StoreState } from "@/types";

const KEY = "hh-finance-store-v2"; // schema: { debts, earnings, expenses }, money is {value,currency}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { debts: [], earnings: [], expenses: [] };
    const parsed = JSON.parse(raw);
    return {
      debts: parsed.debts ?? [],
      earnings: parsed.earnings ?? [],
      // Map to current shape in case older data had extra fields (e.g., cadence)
      expenses: (parsed.expenses ?? []).map((x: any) => ({ id: x.id, name: x.name, amount: x.amount })),
    };
  } catch {
    return { debts: [], earnings: [], expenses: [] };
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
