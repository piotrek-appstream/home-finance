import { useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

import { useStore } from "@/hooks/useStore";
import { Stat } from "@/components/Stat";
import { DebtForm } from "@/components/debts/DebtForm";
import { DebtTable } from "@/components/debts/DebtTable";
import { EarningForm } from "@/components/earnings/EarningForm";
import { EarningTable } from "@/components/earnings/EarningTable";
import { fmtMoney, sumByCurrency } from "@/utils/money";
import type { Money } from "@/types";

export default function App() {
  const [store, setStore] = useStore();
  const [tab, setTab] = useState("summary");
  const fileRef = useRef<HTMLInputElement>(null);

  // Totals per currency
  const totals = useMemo(() => {
    const earnings = sumByCurrency(store.earnings.map((e) => e.amount));
    const debts = sumByCurrency(store.debts.map((d) => d.amount));
    return { earnings, debts };
  }, [store]);

  // Pretty total string per currency
  function totalStr(map: Map<any, number>, currency: string): string {
    const v = map.get(currency as any) || 0;
    const m: Money = { value: v, currency: currency as any };
    return fmtMoney(m);
  }

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
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="debts">Debts</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        {/* Summary */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Stat title="Earnings (PLN)" value={totalStr(totals.earnings, "PLN")} />
            <Stat title="Earnings (USD)" value={totalStr(totals.earnings, "USD")} />
            <Stat title="Earnings (EUR)" value={totalStr(totals.earnings, "EUR")} />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Stat title="Debts (PLN)" value={totalStr(totals.debts, "PLN")} />
            <Stat title="Debts (USD)" value={totalStr(totals.debts, "USD")} />
            <Stat title="Debts (EUR)" value={totalStr(totals.debts, "EUR")} />
          </div>

          <Card>
            <CardHeader><CardTitle>Upcoming Debts</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Manage details in the Debts tab.
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debts */}
        <TabsContent value="debts" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Debt</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <DebtForm onAdd={(d) => setStore({ ...store, debts: [d, ...store.debts] })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>All Debts</CardTitle></CardHeader>
            <CardContent>
              <DebtTable debts={store.debts}
                onDelete={(id) => setStore({ ...store, debts: store.debts.filter((x) => x.id !== id) })} />
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
      </Tabs>

      <footer className="text-xs text-muted-foreground pt-4">
        Data is saved in your browser (localStorage). Use Export/Import to sync between devices.
      </footer>
    </div>
  );
}
