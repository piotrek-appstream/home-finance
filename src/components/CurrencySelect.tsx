import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Currency } from "@/types";
import { CURRENCIES } from "@/utils/money";

export function CurrencySelect({ value, onChange, className }: { value: Currency; onChange: (v: Currency) => void; className?: string }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Currency)}>
      <SelectTrigger className={className}><SelectValue /></SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c} value={c}>{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

