import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/Field";
import type { Currency, FuturePayment } from "@/types";
import { uid } from "@/utils/money";
import { Plus } from "lucide-react";
import { MoneyInput } from "@/components/MoneyInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { formatYmd } from "@/utils/date";

export function FuturePaymentForm({ onAdd }: { onAdd: (d: FuturePayment) => void }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>("PLN");
  const [dueDate, setDueDate] = useState<string>(formatYmd(new Date()));
  const [recurrence, setRecurrence] = useState<FuturePayment["recurrence"]>("once");

  return (
    <div className="space-y-3">
      <Field label="Name">
        <Input placeholder="Rent, Car insurance, Tuition..." value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label="Amount">
        <MoneyInput value={value} currency={currency} onValueChange={setValue} onCurrencyChange={setCurrency} />
      </Field>

      <Field label="Due Date">
        <DatePicker value={dueDate} onChange={setDueDate} />
      </Field>

      <Field label="Repeats">
        <Select value={recurrence ?? "once"} onValueChange={(v) => setRecurrence(v as FuturePayment["recurrence"]) }>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="once">One-time</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Button
        className="gap-2"
        onClick={() => {
          if (!name || !dueDate || value <= 0) return;
          onAdd({ id: uid(), name, amount: { value, currency }, dueDate, recurrence });
          setName(""); setValue(0);
        }}
      >
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );
}
