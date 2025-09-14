export function monthsBetween(base: Date, dateIso: string): number {
  const [y, m] = dateIso.slice(0, 7).split("-").map(Number);
  return (y - base.getFullYear()) * 12 + (m - 1 - base.getMonth());
}

export function addMonths(base: Date, add: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + add, 1);
}

export function formatYm(d: Date): string {
  return d.toISOString().slice(0, 7);
}

