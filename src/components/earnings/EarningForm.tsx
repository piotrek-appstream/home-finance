import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/Field";
import type { Currency, Earning } from "@/types";
import { CURRENCIES, uid } from "@/utils/money";
import { Plus } from "lucide-react";

export function EarningForm({ onAdd }: { onAdd: (e: Earning) => void }) {
  const [source, setSource] = useState("");
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // yyyy-mm
  const [value, setValue] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>("PLN");

  return (
    <div className="space-y-3">
      <Field label="Source">
        <Input placeholder="Salary, Bonus, Rental income..." value={source} onChange={(e) => setSource(e.target.value)} />
      </Field>

      <Field label="Month">
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
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
          if (!source || !month || value <= 0) return;
          onAdd({ id: uid(), source, month, amount: { value, currency } });
          setSource(""); setValue(0);
        }}
      >
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );
}
