import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import { useStore } from "@/hooks/useStore";
import type { Currency } from "@/types";
import { AppHeader } from "@/components/layout/AppHeader";
import { SummaryTab } from "@/components/tabs/SummaryTab";
import { PlanTab } from "@/components/tabs/PlanTab";
import { FuturePaymentsTab } from "@/components/tabs/FuturePaymentsTab";
import { EarningsTab } from "@/components/tabs/EarningsTab";
import { SavingsTab } from "@/components/tabs/SavingsTab";
import { ExpensesTab } from "@/components/tabs/ExpensesTab";
import { getDemoStore } from "@/lib/demo";

const UI_KEYS = {
  tab: "hh-ui-tab",
  currency: "hh-ui-currency",
  horizon: "hh-ui-horizon-months",
} as const;

export default function App() {
  const isDemo = typeof window !== "undefined" && window.location && window.location.pathname.startsWith("/demo");
  const [store, setStore] = useStore({ initial: isDemo ? getDemoStore() : undefined, persist: !isDemo });
  const [tab, setTab] = useState<string>(() => localStorage.getItem(UI_KEYS.tab) || "summary");
  const [displayCurrency, setDisplayCurrency] = useState<Currency>(() => (localStorage.getItem(UI_KEYS.currency) as Currency) || "PLN");
  const [horizonMonths, setHorizonMonths] = useState<number>(() => {
    const v = Number(localStorage.getItem(UI_KEYS.horizon));
    return Number.isFinite(v) && v > 0 ? v : 24;
  });

  // Calculation moved into individual tabs

  // Persist UI state
  useEffect(() => { localStorage.setItem(UI_KEYS.tab, tab); }, [tab]);
  useEffect(() => { localStorage.setItem(UI_KEYS.currency, displayCurrency); }, [displayCurrency]);
  useEffect(() => { localStorage.setItem(UI_KEYS.horizon, String(horizonMonths)); }, [horizonMonths]);

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-4">
      <AppHeader
        displayCurrency={displayCurrency}
        onDisplayCurrencyChange={setDisplayCurrency}
        state={store}
        onImport={(json) => { setStore(json); setTab("summary"); }}
      />

      <Tabs value={tab} onValueChange={setTab}>
        {/* Make tabs horizontally scrollable on small screens */}
        <div className="overflow-x-auto -mx-1 md:mx-0">
          <TabsList className="min-w-max gap-1">
            <TabsTrigger className="flex-none" value="summary">Summary</TabsTrigger>
            <TabsTrigger className="flex-none" value="plan">Plan</TabsTrigger>
            <TabsTrigger className="flex-none" value="future-payments">Future Payments</TabsTrigger>
            <TabsTrigger className="flex-none" value="savings">Savings</TabsTrigger>
            <TabsTrigger className="flex-none" value="earnings">Earnings</TabsTrigger>
            <TabsTrigger className="flex-none" value="expenses">Monthly Expenses</TabsTrigger>
          </TabsList>
        </div>

        {/* Summary */}
        <TabsContent value="summary">
          <SummaryTab store={store} displayCurrency={displayCurrency} />
        </TabsContent>

        {/* Plan */}
        <TabsContent value="plan">
          <PlanTab
            store={store}
            setStore={setStore}
            displayCurrency={displayCurrency}
            horizonMonths={horizonMonths}
            setHorizonMonths={setHorizonMonths}
          />
        </TabsContent>

        {/* Future Payments */}
        <TabsContent value="future-payments">
          <FuturePaymentsTab store={store} setStore={setStore} />
        </TabsContent>

        {/* Earnings */}
        <TabsContent value="earnings">
          <EarningsTab store={store} setStore={setStore} />
        </TabsContent>

        {/* Savings */}
        <TabsContent value="savings">
          <SavingsTab store={store} setStore={setStore} />
        </TabsContent>

        {/* Expenses */}
        <TabsContent value="expenses">
          <ExpensesTab store={store} setStore={setStore} />
        </TabsContent>
      </Tabs>

      <footer className="text-xs text-muted-foreground pt-4">
        {isDemo ? (
          <span>
            Demo mode — changes are not saved. Navigate to "/" for your data.
          </span>
        ) : (
          <span>
            Data is saved in your browser (localStorage). Use Export/Import to sync between devices.
          </span>
        )}
      </footer>
    </div>
  );
}
