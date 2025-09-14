import type { StoreState } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";

export function ExpensesTab({ store, setStore }: { store: StoreState; setStore: (next: StoreState | ((prev: StoreState) => StoreState)) => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add Monthly Expense</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <ExpenseForm onAdd={(e) => setStore({ ...store, expenses: [e, ...store.expenses] })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Monthly Expenses</CardTitle></CardHeader>
        <CardContent>
          <ExpenseTable expenses={store.expenses} onDelete={(id) => setStore({ ...store, expenses: store.expenses.filter((x) => x.id !== id) })} />
        </CardContent>
      </Card>
    </div>
  );
}

