import { Label } from "@/components/ui/label";
import React from "react";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-2 grid-cols-1 md:grid-cols-4">
      <Label className="text-sm md:col-span-1">{label}</Label>
      <div className="md:col-span-3">{children}</div>
    </div>
  );
}
