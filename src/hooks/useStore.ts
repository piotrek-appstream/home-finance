import { useEffect, useRef, useState } from "react";
import type { StoreState } from "@/types";
import { loadStore, saveStore } from "@/lib/storage";

export function useStore() {
  const [state, setState] = useState<StoreState>(() => loadStore());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveStore(state), 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state]);

  return [state, setState] as const;
}
