import { useEffect, useMemo, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "hh-ui-theme" as const;
type ThemeMode = "system" | "light" | "dark";

function readSaved(): ThemeMode {
  const v = localStorage.getItem(THEME_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

function apply(mode: ThemeMode, mql: MediaQueryList | null) {
  const d = document.documentElement;
  d.classList.remove("dark", "light");
  if (mode === "dark") d.classList.add("dark");
  if (mode === "light") d.classList.add("light");
  const isDark = mode === "dark" || (mode === "system" && !!mql?.matches);
  d.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>(() => readSaved());
  const mql = useMemo(() => window.matchMedia?.("(prefers-color-scheme: dark)") ?? null, []);

  // Apply + persist on mode change; sync with OS if in system mode
  useEffect(() => {
    localStorage.setItem(THEME_KEY, mode);
    apply(mode, mql);
    if (mode === "system" && mql) {
      const handler = () => apply("system", mql);
      mql.addEventListener?.("change", handler);
      return () => mql.removeEventListener?.("change", handler);
    }
  }, [mode, mql]);

  // Determine current resolved theme to pick icon and next toggle
  const resolvedDark = mode === "dark" || (mode === "system" && !!mql?.matches);

  function onToggle() {
    setMode(resolvedDark ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={className}
      aria-label="Toggle theme"
      title={resolvedDark ? "Switch to light" : "Switch to dark"}
    >
      {resolvedDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

