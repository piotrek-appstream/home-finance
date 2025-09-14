import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/Field";
import type { Currency, Earning } from "@/types";
import { uid } from "@/utils/money";
import { Plus } from "lucide-react";
import { MoneyInput } from "@/components/MoneyInput";

export function EarningForm({ onAdd }: { onAdd: (e: Earning) => void }) {
  const [source, setSource] = useState("");
  const [value, setValue] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>("PLN");

  return (
    <div className="space-y-3">
      <Field label="Source">
        <Input placeholder="Salary, Bonus, Rental income..." value={source} onChange={(e) => setSource(e.target.value)} />
      </Field>

      <Field label="Amount">
        <MoneyInput value={value} currency={currency} onValueChange={setValue} onCurrencyChange={setCurrency} />
      </Field>

      <Button
        className="gap-2"
        onClick={() => {
          if (!source || value <= 0) return;
          onAdd({ id: uid(), source, amount: { value, currency } });
          setSource(""); setValue(0);
        }}
      >
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );
}
