import { useMemo } from "react";
import type { Currency, StoreState } from "@/types";
import { PlanInputs } from "@/components/planning/PlanInputs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { simulatePlan } from "@/utils/planning";
import { PlanFundingVsRequiredChart } from "@/components/planning/PlanFundingVsRequiredChart";
import { FuturePaymentsSchedule } from "@/components/planning/FuturePaymentsSchedule";

export function PlanTab({
  store,
  setStore,
  displayCurrency,
  horizonMonths,
  setHorizonMonths,
}: {
  store: StoreState;
  setStore: (next: StoreState | ((prev: StoreState) => StoreState)) => void;
  displayCurrency: Currency;
  horizonMonths: number;
  setHorizonMonths: (n: number) => void;
}) {
  const planSim = useMemo(() => simulatePlan(store, store.plan, displayCurrency), [store, displayCurrency]);

  return (
    <div className="space-y-4">
      <PlanInputs state={store} displayCurrency={displayCurrency} onChange={(plan) => setStore({ ...store, plan })} />

      <Card>
        <CardHeader>
          <CardTitle>Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              On-time future payments: {planSim.onTimeCount}/{planSim.totalFuturePayments}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Horizon (months)</span>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={horizonMonths}
                onChange={(e) => {
                  const v = Math.max(1, Number(e.target.value || 0));
                  setHorizonMonths(v);
                }}
                className="w-[100px] shrink-0"
              />
            </div>
          </div>
          <PlanFundingVsRequiredChart state={store} planSim={planSim} displayCurrency={displayCurrency} horizonMonths={horizonMonths} />
          <FuturePaymentsSchedule futurePayments={planSim.futurePayments} />
        </CardContent>
      </Card>
    </div>
  );
}
