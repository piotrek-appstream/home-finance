import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/Field";
import type { Currency, Saving } from "@/types";
import { CURRENCIES, uid } from "@/utils/money";
import { Plus } from "lucide-react";

export function SavingForm({ onAdd }: { onAdd: (s: Saving) => void }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>("PLN");

  return (
    <div className="space-y-3">
      <Field label="Name">
        <Input placeholder="Cash, Bank, Brokerage..." value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label="Amount">
        <div className="flex gap-2">
          <Input type="number" inputMode="decimal" value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full" />
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
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

