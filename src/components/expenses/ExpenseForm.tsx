import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/Field";
import type { Currency, RecurringExpense } from "@/types";
import { uid } from "@/utils/money";
import { Plus } from "lucide-react";
import { MoneyInput } from "@/components/MoneyInput";

export function ExpenseForm({ onAdd }: { onAdd: (e: RecurringExpense) => void }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>("PLN");

  return (
    <div className="space-y-3">
      <Field label="Name">
        <Input placeholder="Rent, Bills, Groceries..." value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label="Amount">
        <MoneyInput value={value} currency={currency} onValueChange={setValue} onCurrencyChange={setCurrency} />
      </Field>

      <Button
        className="gap-2"
        onClick={() => {
          if (!name || value <= 0) return;
          onAdd({ id: uid(), name, amount: { value, currency } });
          setName(""); setValue(0);
        }}
      >
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );
}
