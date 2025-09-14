import { Input } from "@/components/ui/input";
import type { Currency } from "@/types";
import { CurrencySelect } from "@/components/CurrencySelect";

export function MoneyInput({
  value,
  currency,
  onValueChange,
  onCurrencyChange,
  inputClassName,
  selectClassName,
}: {
  value: number;
  currency: Currency;
  onValueChange: (n: number) => void;
  onCurrencyChange: (c: Currency) => void;
  inputClassName?: string;
  selectClassName?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className={inputClassName ?? "min-w-0 flex-1"}
      />
      <CurrencySelect value={currency} onChange={onCurrencyChange} className={selectClassName ?? "shrink-0 w-[120px]"} />
    </div>
  );
}
