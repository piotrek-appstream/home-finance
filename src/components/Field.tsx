import { Label } from "@/components/ui/label";
import React from "react";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-4 items-center gap-2">
      <Label className="col-span-1 text-sm">{label}</Label>
      <div className="col-span-3">{children}</div>
    </div>
  );
}
