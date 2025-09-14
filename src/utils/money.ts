import type { Currency, Money } from "@/types";

export const CURRENCIES: Currency[] = ["PLN", "USD", "EUR"];

export function fmtMoney(m: Money) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: m.currency,
  }).format(m.value || 0);
}

export function sumByCurrency(items: Money[]) {
  const map = new Map<Currency, number>([
    ["PLN", 0],
    ["USD", 0],
    ["EUR", 0],
  ]);
  for (const m of items) {
    map.set(m.currency, (map.get(m.currency) || 0) + (m.value || 0));
  }
  return map;
}

export const uid = () => Math.random().toString(36).slice(2, 9);
