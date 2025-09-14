import { useMemo } from "react";
import type { Currency, StoreState } from "@/types";
import { totalInCurrency } from "@/utils/fx";
import { fmtMoney } from "@/utils/money";
import { Stat } from "@/components/Stat";
import { monthsBetween, formatYmd } from "@/utils/date";

export function SummaryTab({ store, displayCurrency }: { store: StoreState; displayCurrency: Currency }) {
  const totals = useMemo(() => {
    const earnings = totalInCurrency(store.earnings.map((e) => e.amount), displayCurrency);
    // Sum of payments due in the next 12 months (including recurring yearly)
    const now = new Date();
    const upcoming = [] as typeof store.futurePayments;
    for (const d of store.futurePayments) {
      const recur = d.recurrence ?? "once";
      if (recur === "once") {
        const diff = monthsBetween(now, d.dueDate);
        if (diff >= 0 && diff <= 12) upcoming.push(d);
        continue;
      }
      if (recur === "yearly") {
        const parts = d.dueDate.split("-").map(Number);
        const m0 = parts[1];
        const day = parts[2];
        const startYear = now.getFullYear();
        const years = Math.ceil(12 / 12) + 1;
        for (let k = -1; k <= years; k++) {
          const y = startYear + k;
          const dt = new Date(y, m0 - 1, day);
          const iso = formatYmd(dt);
          const diff = monthsBetween(now, iso);
          if (diff >= 0 && diff <= 12) {
            upcoming.push({ ...d, dueDate: iso });
          }
        }
      }
    }
    const futurePayments = totalInCurrency(upcoming.map((d) => d.amount), displayCurrency);
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
          <Stat title={`Payments Due (12m) (${displayCurrency})`} value={fmtMoney(totals.futurePayments)} />
        </div>
      </div>
    </div>
  );
}
