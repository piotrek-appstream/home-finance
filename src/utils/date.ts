export function monthsBetween(base: Date, dateIso: string): number {
  const [y, m] = dateIso.slice(0, 7).split("-").map(Number);
  return (y - base.getFullYear()) * 12 + (m - 1 - base.getMonth());
}

export function addMonths(base: Date, add: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + add, 1);
}

function pad2(n: number): string { return n < 10 ? `0${n}` : String(n); }

export function formatYm(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${pad2(m)}`;
}

export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${pad2(m)}-${pad2(day)}`;
}
