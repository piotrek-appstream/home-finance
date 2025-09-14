import { useEffect, useRef, useState } from "react";
import type { StoreState } from "@/types";
import { loadStore, saveStore } from "@/lib/storage";

type UseStoreOptions = {
  initial?: StoreState;
  persist?: boolean;
};

export function useStore(options: UseStoreOptions = {}) {
  const { initial, persist = true } = options;

  const [state, setState] = useState<StoreState>(() => (initial ? initial : loadStore()));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!persist) return; // demo mode or external persistence disabled
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveStore(state), 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, persist]);

  return [state, setState] as const;
}
