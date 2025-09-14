import { CurrencySelect } from "@/components/CurrencySelect";
import { ImportExport } from "@/components/ImportExport";
import type { Currency, StoreState } from "@/types";

export function AppHeader({
  displayCurrency,
  onDisplayCurrencyChange,
  state,
  onImport,
}: {
  displayCurrency: Currency;
  onDisplayCurrencyChange: (c: Currency) => void;
  state: StoreState;
  onImport: (s: StoreState) => void;
}) {
  return (
    <header className="flex items-center justify-between gap-2">
      <h1 className="text-3xl font-semibold">Household Finance Manager</h1>
      <div className="flex items-center gap-2">
        <CurrencySelect value={displayCurrency} onChange={onDisplayCurrencyChange} className="w-[130px]" />
        <ImportExport state={state} onImport={onImport} />
      </div>
    </header>
  );
}

