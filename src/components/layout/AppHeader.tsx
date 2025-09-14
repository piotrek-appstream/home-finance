import { CurrencySelect } from "@/components/CurrencySelect";
import { ImportExport } from "@/components/ImportExport";
import { ThemeToggle } from "@/components/ThemeToggle";
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
    <header className="flex flex-wrap items-center gap-2">
      <h1 className="text-2xl md:text-3xl font-semibold flex-1 min-w-0">
        Household Finance Manager
      </h1>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <ThemeToggle />
        <CurrencySelect value={displayCurrency} onChange={onDisplayCurrencyChange} className="w-[120px] sm:w-[130px]" />
        <ImportExport state={state} onImport={onImport} />
      </div>
    </header>
  );
}
