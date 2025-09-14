import { useMemo } from "react";
import type { Currency, StoreState } from "@/types";
import { totalInCurrency } from "@/utils/fx";
import { fmtMoney } from "@/utils/money";
import { Stat } from "@/components/Stat";

export function SummaryTab({ store, displayCurrency }: { store: StoreState; displayCurrency: Currency }) {
  const totals = useMemo(() => {
    const earnings = totalInCurrency(store.earnings.map((e) => e.amount), displayCurrency);
    const futurePayments = totalInCurrency(store.futurePayments.map((d) => d.amount), displayCurrency);
    const expenses = totalInCurrency(store.expenses.map((x) => x.amount), displayCurrency);
    const savings = totalInCurrency(store.savings.map((s) => s.amount), displayCurrency);
    const balance = { value: (earnings.value || 0) - (expenses.value || 0), currency: displayCurrency } as const;
    return { earnings, futurePayments, expenses, savings, balance };
  }, [store, displayCurrency]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Monthly</div>
        <div className="grid md:grid-cols-3 gap-4">
          <Stat title={`Earnings (${displayCurrency})`} value={fmtMoney(totals.earnings)} />
          <Stat title={`Expenses (${displayCurrency})`} value={fmtMoney(totals.expenses)} />
          <Stat title={`Balance (${displayCurrency})`} value={fmtMoney(totals.balance)} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Absolute</div>
        <div className="grid md:grid-cols-3 gap-4">
          <Stat title={`Savings (${displayCurrency})`} value={fmtMoney(totals.savings)} />
          <Stat title={`Future Payments (${displayCurrency})`} value={fmtMoney(totals.futurePayments)} />
        </div>
      </div>
    </div>
  );
}

