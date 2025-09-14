import type { Currency, Money } from "@/types";

// Hardcoded rates (edit any time):
// Meaning: how many PLN for 1 unit of the currency
export const FX_RATES_PLN: Record<Currency, number> = {
  PLN: 1,
  USD: 3.63,
  EUR: 4.25,
};

export function convertMoney(m: Money, to: Currency, rates = FX_RATES_PLN): Money {
  const pln = m.value * rates[m.currency];          // to PLN
  const target = pln / rates[to];                   // PLN -> target
  return { value: target, currency: to };
}

export function totalInCurrency(items: Money[], to: Currency, rates = FX_RATES_PLN): Money {
  const totalPln = items.reduce((sum, m) => sum + m.value * rates[m.currency], 0);
  return { value: totalPln / rates[to], currency: to };
}
