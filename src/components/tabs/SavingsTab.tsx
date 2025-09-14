import type { StoreState } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm } from "@/components/savings/SavingForm";
import { SavingTable } from "@/components/savings/SavingTable";

export function SavingsTab({ store, setStore }: { store: StoreState; setStore: (next: StoreState | ((prev: StoreState) => StoreState)) => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add Saving</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <SavingForm onAdd={(s) => setStore({ ...store, savings: [s, ...store.savings] })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Savings</CardTitle></CardHeader>
        <CardContent>
          <SavingTable savings={store.savings} onDelete={(id) => setStore({ ...store, savings: store.savings.filter((x) => x.id !== id) })} />
        </CardContent>
      </Card>
    </div>
  );
}

