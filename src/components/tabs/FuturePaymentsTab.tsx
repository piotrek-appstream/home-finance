import type { StoreState } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FuturePaymentForm } from "@/components/future-payments/FuturePaymentForm";
import { FuturePaymentTable } from "@/components/future-payments/FuturePaymentTable";

export function FuturePaymentsTab({ store, setStore }: { store: StoreState; setStore: (next: StoreState | ((prev: StoreState) => StoreState)) => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add Future Payment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <FuturePaymentForm onAdd={(d) => setStore({ ...store, futurePayments: [d, ...store.futurePayments] })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Future Payments</CardTitle></CardHeader>
        <CardContent>
          <FuturePaymentTable
            futurePayments={store.futurePayments}
            onDelete={(id) => setStore({ ...store, futurePayments: store.futurePayments.filter((x) => x.id !== id) })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

