import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Currency, Plan, StoreState } from "@/types";
import { CURRENCIES } from "@/utils/money";
import { fmtMoney } from "@/utils/money";
import { simulatePlan } from "@/utils/planning";

export function PlanInputs({ state, onChange, displayCurrency }: { state: StoreState; onChange: (plan: Plan) => void; displayCurrency: Currency }) {
  const { plan } = state;
  const sim = useMemo(() => simulatePlan(state, plan, displayCurrency), [state, plan, displayCurrency]);

  return (
    <Card>
      <CardHeader><CardTitle>Plan Inputs</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm">Future Payment Set-Aside (per month)</Label>
          <div className="flex gap-2">
            <Input type="number" inputMode="decimal" value={plan.futurePaymentPerMonth.value}
              onChange={(e) => onChange({ ...plan, futurePaymentPerMonth: { ...plan.futurePaymentPerMonth, value: Number(e.target.value) } })} />
            <Select value={plan.futurePaymentPerMonth.currency} onValueChange={(v) => onChange({ ...plan, futurePaymentPerMonth: { ...plan.futurePaymentPerMonth, currency: v as Currency } })}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Field label="Priority">
          <Select value={plan.priority} onValueChange={(v) => onChange({ ...plan, priority: v as Plan["priority"] })}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">By due date</SelectItem>
              <SelectItem value="amount">By amount (smallest first)</SelectItem>
              <SelectItem value="custom" disabled>Custom (coming soon)</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="space-y-2">
          <Label className="text-sm">Use Savings as Seed for Future Payments</Label>
          <div className="grid md:grid-cols-2 gap-2">
            {state.savings.map((s) => (
              <label key={s.id} className="flex items-center gap-2 p-2 rounded border">
                <Checkbox checked={plan.seedSavingsIds.includes(s.id)} onCheckedChange={(ck) => {
                  const checked = Boolean(ck);
                  const ids = new Set(plan.seedSavingsIds);
                  if (checked) ids.add(s.id); else ids.delete(s.id);
                  onChange({ ...plan, seedSavingsIds: Array.from(ids) });
                }} />
                <span className="flex-1">{s.name}</span>
                <span className="text-sm text-muted-foreground">{fmtMoney(s.amount)}</span>
              </label>
            ))}
            {state.savings.length === 0 && (
              <div className="text-sm text-muted-foreground">No savings yet. Add some under the Savings tab.</div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <SummaryItem label="Monthly Budget" value={fmtMoney(sim.monthlyBudget)} />
          <SummaryItem label="Allocated (Future Payments)" value={`${fmtMoney({ ...sim.monthlyBudget, value: sim.monthlyBudget.value - sim.remainingAfterAlloc.value })}`} />
          <SummaryItem label="Remaining" value={fmtMoney(sim.remainingAfterAlloc)} />
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded border">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-medium">{value}</div>
    </div>
  );
}
