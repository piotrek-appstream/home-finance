import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import React, { useRef } from "react";
import type { StoreState } from "@/types";

export function ImportExport({ state, onImport }: { state: StoreState; onImport: (s: StoreState) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `household-finance-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const json = JSON.parse(String(r.result));
        // minimal sanity checks
        if (!json || typeof json !== "object") throw new Error("Invalid");
        onImport(json as StoreState);
      } catch {
        alert("Invalid file");
      }
    };
    r.readAsText(f);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={doExport} className="gap-2">
        <Download className="h-4 w-4" /> Export
      </Button>
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={doImport} />
      <Button variant="secondary" onClick={() => fileRef.current?.click()} className="gap-2">
        <Upload className="h-4 w-4" /> Import
      </Button>
    </div>
  );
}

