import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/Field";
import type { Currency, FuturePayment } from "@/types";
import { uid } from "@/utils/money";
import { Plus } from "lucide-react";
import { MoneyInput } from "@/components/MoneyInput";

export function FuturePaymentForm({ onAdd }: { onAdd: (d: FuturePayment) => void }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>("PLN");
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-3">
      <Field label="Name">
        <Input placeholder="Rent, Car insurance, Tuition..." value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label="Amount">
        <MoneyInput value={value} currency={currency} onValueChange={setValue} onCurrencyChange={setCurrency} />
      </Field>

      <Field label="Due Date">
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </Field>

      <Button
        className="gap-2"
        onClick={() => {
          if (!name || !dueDate || value <= 0) return;
          onAdd({ id: uid(), name, amount: { value, currency }, dueDate });
          setName(""); setValue(0);
        }}
      >
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );
}
