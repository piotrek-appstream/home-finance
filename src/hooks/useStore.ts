import { useEffect, useState } from "react";
import type { StoreState } from "@/types";

const KEY = "hh-finance-store-v2"; // new schema (money is {value,currency})

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { debts: [], earnings: [] };
    const parsed = JSON.parse(raw);
    return {
      debts: parsed.debts ?? [],
      earnings: parsed.earnings ?? [],
    };
  } catch {
    return { debts: [], earnings: [] };
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
