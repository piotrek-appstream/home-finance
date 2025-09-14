import { useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Upload } from "lucide-react";

import { useStore } from "@/hooks/useStore";
import { Stat } from "@/components/Stat";
import { FuturePaymentForm } from "@/components/future-payments/FuturePaymentForm";
import { FuturePaymentTable } from "@/components/future-payments/FuturePaymentTable";
import { EarningForm } from "@/components/earnings/EarningForm";
import { EarningTable } from "@/components/earnings/EarningTable";
import { fmtMoney, CURRENCIES } from "@/utils/money";
import { totalInCurrency } from "@/utils/fx";
import type { Currency } from "@/types";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { SavingForm } from "@/components/savings/SavingForm";
import { SavingTable } from "@/components/savings/SavingTable";
import { PlanInputs } from "@/components/planning/PlanInputs";
import { FuturePaymentsSchedule } from "@/components/planning/FuturePaymentsSchedule";
import { PlanFundingVsRequiredChart } from "@/components/planning/PlanFundingVsRequiredChart";
import { simulatePlan } from "@/utils/planning";

export default function App() {
  const [store, setStore] = useStore();
  const [tab, setTab] = useState("summary");
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("PLN");
  const [horizonMonths, setHorizonMonths] = useState<number>(24);
  const fileRef = useRef<HTMLInputElement>(null);

  // Totals converted into the display currency
  const convertedTotals = useMemo(() => {
    const earnings = totalInCurrency(store.earnings.map((e) => e.amount), displayCurrency);
    const futurePayments = totalInCurrency(store.futurePayments.map((d) => d.amount), displayCurrency);
    const expenses = totalInCurrency(store.expenses.map((x) => x.amount), displayCurrency);
    const savings = totalInCurrency(store.savings.map((s) => s.amount), displayCurrency);
    const balance = { value: (earnings.value || 0) - (expenses.value || 0), currency: displayCurrency } as const;
    return { earnings, futurePayments, expenses, savings, balance };
  }, [store, displayCurrency]);

  const planSim = useMemo(() => simulatePlan(store, store.plan, displayCurrency), [store, displayCurrency]);

  // Export/Import
  const doExport = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
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
        setStore(json);
        setTab("summary");
      } catch {
        alert("Invalid file");
      }
    };
    r.readAsText(f);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold">Household Finance Manager</h1>
        <div className="flex items-center gap-2">
          {/* Display currency selector (for summaries only) */}
          <Select value={displayCurrency} onValueChange={(v) => setDisplayCurrency(v as Currency)}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Currency" /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c} (display)</SelectItem>)}
            </SelectContent>
          </Select>

          <Button variant="secondary" onClick={doExport} className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={doImport} />
          <Button variant="secondary" onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" /> Import
          </Button>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-6 w-full md:w-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="future-payments">Future Payments</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        {/* Summary */}
        <TabsContent value="summary" className="space-y-6">
          {/* Monthly values */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Monthly</div>
            <div className="grid md:grid-cols-3 gap-4">
              <Stat title={`Earnings (${displayCurrency})`} value={fmtMoney(convertedTotals.earnings)} />
              <Stat title={`Expenses (${displayCurrency})`} value={fmtMoney(convertedTotals.expenses)} />
              <Stat title={`Balance (${displayCurrency})`} value={fmtMoney(convertedTotals.balance)} />
            </div>
          </div>

          {/* Absolute values */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Absolute</div>
            <div className="grid md:grid-cols-3 gap-4">
              <Stat title={`Savings (${displayCurrency})`} value={fmtMoney(convertedTotals.savings)} />
              <Stat title={`Future Payments (${displayCurrency})`} value={fmtMoney(convertedTotals.futurePayments)} />
            </div>
          </div>
        </TabsContent>

        {/* Plan */}
        <TabsContent value="plan" className="space-y-4">
          <PlanInputs state={store} displayCurrency={displayCurrency} onChange={(plan) => setStore({ ...store, plan })} />

          <Card>
            <CardHeader>
              <CardTitle>Simulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  On-time future payments: {planSim.onTimeCount}/{planSim.totalFuturePayments}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Horizon (months)</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={horizonMonths}
                    onChange={(e) => {
                      const v = Math.max(1, Number(e.target.value || 0));
                      setHorizonMonths(v);
                    }}
                    className="w-[100px]"
                  />
                </div>
              </div>
              <PlanFundingVsRequiredChart state={store} planSim={planSim} displayCurrency={displayCurrency} horizonMonths={horizonMonths} />
              <FuturePaymentsSchedule futurePayments={planSim.futurePayments} />
            </CardContent>
          </Card>

          {/* SavingsProjection removed as savings input is scrapped from Plan */}
        </TabsContent>

        {/* Future Payments */}
        <TabsContent value="future-payments" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Future Payment</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <FuturePaymentForm onAdd={(d) => setStore({ ...store, futurePayments: [d, ...store.futurePayments] })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>All Future Payments</CardTitle></CardHeader>
            <CardContent>
              {/* (Optional) Could show a converted column here too */}
              <FuturePaymentTable futurePayments={store.futurePayments}
                onDelete={(id) => setStore({ ...store, futurePayments: store.futurePayments.filter((x) => x.id !== id) })} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Earnings */}
        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Monthly Earning</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <EarningForm onAdd={(e) => setStore({ ...store, earnings: [e, ...store.earnings] })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>All Earnings</CardTitle></CardHeader>
            <CardContent>
              <EarningTable earnings={store.earnings}
                onDelete={(id) => setStore({ ...store, earnings: store.earnings.filter((x) => x.id !== id) })} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Savings */}
        <TabsContent value="savings" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Saving</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <SavingForm onAdd={(s) => setStore({ ...store, savings: [s, ...store.savings] })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>All Savings</CardTitle></CardHeader>
            <CardContent>
              <SavingTable savings={store.savings}
                onDelete={(id) => setStore({ ...store, savings: store.savings.filter((x) => x.id !== id) })} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Monthly Expense</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ExpenseForm onAdd={(e) => setStore({ ...store, expenses: [e, ...store.expenses] })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>All Monthly Expenses</CardTitle></CardHeader>
            <CardContent>
              <ExpenseTable expenses={store.expenses}
                onDelete={(id) => setStore({ ...store, expenses: store.expenses.filter((x) => x.id !== id) })} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="text-xs text-muted-foreground pt-4">
        Data is saved in your browser (localStorage). Use Export/Import to sync between devices.
      </footer>
    </div>
  );
}
