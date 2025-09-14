import type { StoreState } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EarningForm } from "@/components/earnings/EarningForm";
import { EarningTable } from "@/components/earnings/EarningTable";

export function EarningsTab({ store, setStore }: { store: StoreState; setStore: (next: StoreState | ((prev: StoreState) => StoreState)) => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add Monthly Earning</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <EarningForm onAdd={(e) => setStore({ ...store, earnings: [e, ...store.earnings] })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Earnings</CardTitle></CardHeader>
        <CardContent>
          <EarningTable earnings={store.earnings} onDelete={(id) => setStore({ ...store, earnings: store.earnings.filter((x) => x.id !== id) })} />
        </CardContent>
      </Card>
    </div>
  );
}

