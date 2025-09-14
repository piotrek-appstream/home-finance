import React from "react";

export function Badge({ children, variant = "secondary" }: { children: React.ReactNode; variant?: "secondary" | "destructive" }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const styles = variant === "destructive"
    ? "bg-red-100 text-red-800"
    : "bg-gray-100 text-gray-800";
  return <span className={`${base} ${styles}`}>{children}</span>;
}

