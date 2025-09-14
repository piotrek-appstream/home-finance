import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Upload, Trash2, Plus, Save, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";

// --- Types ---
type Txn = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  type: "income" | "expense" | "transfer";
  category: string;
  note?: string;
  amount: number; // positive
};

type Debt = {
  id: string;
  name: string;
  balance: number;
  apr: number; // %
  minPayment: number;
  dueDay?: number; // 1-28
};

type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
};

// --- Storage helpers ---
const KEY = "hh-finance-store-v1";

function loadStore(): StoreState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { txns: [], debts: [], goals: [], settings: { currency: "PLN" } };
    const parsed = JSON.parse(raw);
    return {
      txns: parsed.txns ?? [],
      debts: parsed.debts ?? [],
      goals: parsed.goals ?? [],
      settings: parsed.settings ?? { currency: "PLN" },
    } as StoreState;
  } catch {
    return { txns: [], debts: [], goals: [], settings: { currency: "PLN" } };
  }
}

function saveStore(s: StoreState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

// --- Store ---

type StoreState = {
  txns: Txn[];
  debts: Debt[];
  goals: Goal[];
  settings: { currency: string };
};

function useStore() {
  const [state, setState] = useState<StoreState>(() => loadStore());
  useEffect(() => saveStore(state), [state]);
  return [state, setState] as const;
}

// --- Utils ---
const fmtMoney = (v: number, currency = "PLN") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(v);

const uid = () => Math.random().toString(36).slice(2, 9);

function monthKey(dateISO: string) {
  return dateISO.slice(0, 7); // yyyy-mm
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

// Debt payoff (snowball or avalanche)
function computeDebtPlan(debts: Debt[], budget: number, mode: "snowball" | "avalanche" = "avalanche") {
  // clone
  const list = debts.map((d) => ({ ...d }));
  const order = list
    .filter((d) => d.balance > 0)
    .sort((a, b) => (mode === "snowball" ? a.balance - b.balance : b.apr - a.apr));
  const schedule: { month: number; name: string; payment: number; balance: number }[] = [];
  let month = 0;
  let extra = Math.max(0, budget - order.reduce((s, d) => s + d.minPayment, 0));
  // naive simulation for up to 120 months
  while (order.some((d) => d.balance > 0) && month < 120) {
    for (const d of order) {
      if (d.balance <= 0) continue;
      const interest = (d.balance * d.apr) / 100 / 12;
      const base = Math.min(d.balance + interest, d.minPayment + (d === order[0] ? extra : 0));
      d.balance = Math.max(0, d.balance + interest - base);
      schedule.push({ month, name: d.name, payment: base, balance: d.balance });
      if (d.balance === 0 && d === order[0]) {
        // roll the snowball
        order.shift();
        if (order.length) extra += d.minPayment; // freed min payment becomes extra
      }
    }
    month += 1;
  }
  return { months: month, schedule };
}

// --- Forms ---
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-4 items-center gap-2">
      <Label className="col-span-1 text-sm">{label}</Label>
      <div className="col-span-3">{children}</div>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [store, setStore] = useStore();
  const [tab, setTab] = useState("summary");
  const currency = store.settings.currency;

  // Derived totals
  const monthly = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of store.txns) {
      const k = monthKey(t.date);
      if (!map.has(k)) map.set(k, { income: 0, expense: 0 });
      const m = map.get(k)!;
      if (t.type === "income") m.income += t.amount;
      if (t.type === "expense") m.expense += t.amount;
    }
    // last 12 months
    const rows: { month: string; Income: number; Expenses: number; Net: number }[] = [];
    const start = addMonths(startOfMonth(), -11);
    for (let i = 0; i < 12; i++) {
      const d = addMonths(start, i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const val = map.get(key) ?? { income: 0, expense: 0 };
      rows.push({ month: key, Income: val.income, Expenses: val.expense, Net: val.income - val.expense });
    }
    return rows;
  }, [store.txns]);

  const totals = useMemo(() => {
    const income = store.txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = store.txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const net = income - expenses;
    const debtBalance = store.debts.reduce((s, d) => s + d.balance, 0);
    const goalsProgress = store.goals.reduce((s, g) => s + g.current, 0);
    return { income, expenses, net, debtBalance, goalsProgress };
  }, [store]);

  // Import/Export
  const fileRef = useRef<HTMLInputElement>(null);
  const doExport = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `household-finance-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const doImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const json = JSON.parse(String(r.result));
        setStore(json);
        setTab("summary");
      } catch (err) {
        alert("Invalid file");
      }
    };
    r.readAsText(f);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold">Household Finance Manager</h1>
        <div className="flex items-center gap-2">
          <Select
            value={store.settings.currency}
            onValueChange={(v) => setStore({ ...store, settings: { ...store.settings, currency: v } })}
          >
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[
                "PLN",
                "USD",
                "EUR",
                "GBP",
                "CHF",
              ].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={doExport} className="gap-2"><Download className="h-4 w-4" />Export</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={doImport} />
          <Button variant="secondary" onClick={() => fileRef.current?.click()} className="gap-2"><Upload className="h-4 w-4" />Import</Button>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="debts">Debts</TabsTrigger>
          <TabsTrigger value="goals">Savings / Goals</TabsTrigger>
          <TabsTrigger value="planner">Planner</TabsTrigger>
        </TabsList>

        {/* Summary */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Stat title="Total Income" value={fmtMoney(totals.income, currency)} />
            <Stat title="Total Expenses" value={fmtMoney(totals.expenses, currency)} />
            <Stat title="Net" value={fmtMoney(totals.net, currency)} accent={totals.net >= 0} />
            <Stat title="Debt Balance" value={fmtMoney(totals.debtBalance, currency)} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Last 12 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => fmtMoney(v, currency)} />
                    <Legend />
                    <Bar dataKey="Income" />
                    <Bar dataKey="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Transaction</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <TxnForm onAdd={(t) => setStore({ ...store, txns: [{ ...t, id: uid() }, ...store.txns] })} currency={currency} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>All Transactions</CardTitle></CardHeader>
            <CardContent>
              <TxnTable
                txns={store.txns}
                currency={currency}
                onDelete={(id) => setStore({ ...store, txns: store.txns.filter((t) => t.id !== id) })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debts */}
        <TabsContent value="debts" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Debt</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <DebtForm onAdd={(d) => setStore({ ...store, debts: [{ ...d, id: uid() }, ...store.debts] })} currency={currency} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Debts</CardTitle></CardHeader>
            <CardContent>
              <DebtTable debts={store.debts} currency={currency}
                onDelete={(id) => setStore({ ...store, debts: store.debts.filter((x) => x.id !== id) })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Savings / Goal</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <GoalForm onAdd={(g) => setStore({ ...store, goals: [{ ...g, id: uid() }, ...store.goals] })} currency={currency} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Savings / Goals</CardTitle></CardHeader>
            <CardContent>
              <GoalTable goals={store.goals} currency={currency}
                onDelete={(id) => setStore({ ...store, goals: store.goals.filter((x) => x.id !== id) })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planner */}
        <TabsContent value="planner" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Monthly Plan</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-5 gap-4">
              <BudgetSuggest txns={store.txns} currency={currency} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Debt Payoff Simulator</CardTitle></CardHeader>
            <CardContent>
              <DebtSimulator debts={store.debts} currency={currency} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="text-xs text-muted-foreground pt-4">
        Data is saved in your browser (localStorage). Use Export/Import to sync between devices.
      </footer>
    </div>
  );
}

function Stat({ title, value, accent }: { title: string; value: string; accent?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className={`text-2xl font-semibold ${accent ? "text-green-600 dark:text-green-400" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

// --- Transaction Components ---
function TxnForm({ onAdd, currency }: { onAdd: (t: Omit<Txn, "id">) => void; currency: string }) {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<Txn["type"]>("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");

  return (
    <div className="space-y-3">
      <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Type">
        <Select value={type} onValueChange={(v) => setType(v as Txn["type"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Category"><Input placeholder={type === "income" ? "Salary, Bonus, Other" : "Groceries, Rent, Utilities..."} value={category} onChange={(e) => setCategory(e.target.value)} /></Field>
      <Field label={`Amount (${currency})`}><Input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></Field>
      <Field label="Note"><Input placeholder="Optional" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <div className="flex gap-2">
        <Button onClick={() => { if (!date || !category || amount <= 0) return; onAdd({ date, type, category, amount, note }); }} className="gap-2"><Plus className="h-4 w-4" />Add</Button>
        <Button variant="outline" onClick={() => { setCategory(""); setAmount(0); setNote(""); }} className="gap-2"><RefreshCw className="h-4 w-4" />Reset</Button>
      </div>
    </div>
  );
}

function TxnTable({ txns, onDelete, currency }: { txns: Txn[]; onDelete: (id: string) => void; currency: string }) {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Note</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {txns.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No transactions yet.</TableCell></TableRow>
          )}
          {txns.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="whitespace-nowrap">{t.date}</TableCell>
              <TableCell className="capitalize">{t.type}</TableCell>
              <TableCell>{t.category}</TableCell>
              <TableCell className="text-right">{fmtMoney(t.amount, currency)}</TableCell>
              <TableCell className="max-w-[24ch] truncate" title={t.note}>{t.note}</TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={() => onDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// --- Debt Components ---
function DebtForm({ onAdd, currency }: { onAdd: (d: Omit<Debt, "id">) => void; currency: string }) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(0);
  const [apr, setApr] = useState(0);
  const [minPayment, setMinPayment] = useState(0);
  const [dueDay, setDueDay] = useState<number | undefined>(undefined);

  return (
    <div className="space-y-3">
      <Field label="Name"><Input placeholder="e.g., Visa, Car Loan" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label={`Balance (${currency})`}><Input type="number" inputMode="decimal" value={balance} onChange={(e) => setBalance(Number(e.target.value))} /></Field>
      <Field label="APR (%)"><Input type="number" inputMode="decimal" value={apr} onChange={(e) => setApr(Number(e.target.value))} /></Field>
      <Field label={`Min Payment (${currency}/mo)`}><Input type="number" inputMode="decimal" value={minPayment} onChange={(e) => setMinPayment(Number(e.target.value))} /></Field>
      <Field label="Due Day (1-28)"><Input type="number" value={dueDay ?? ""} onChange={(e) => setDueDay(e.target.value ? Number(e.target.value) : undefined)} /></Field>
      <Button className="gap-2" onClick={() => { if (!name || balance <= 0) return; onAdd({ name, balance, apr, minPayment, dueDay }); }}><Plus className="h-4 w-4" />Add</Button>
    </div>
  );
}

function DebtTable({ debts, onDelete, currency }: { debts: Debt[]; onDelete: (id: string) => void; currency: string }) {
  const totalAprWeighted = useMemo(() => {
    const totalBal = debts.reduce((s, d) => s + d.balance, 0);
    if (!totalBal) return 0;
    return debts.reduce((s, d) => s + (d.balance / totalBal) * d.apr, 0);
  }, [debts]);

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">Weighted APR: {totalAprWeighted.toFixed(2)}%</div>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">APR</TableHead>
              <TableHead className="text-right">Min Payment</TableHead>
              <TableHead>Due</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No debts yet.</TableCell></TableRow>
            )}
            {debts.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.name}</TableCell>
                <TableCell className="text-right">{fmtMoney(d.balance, currency)}</TableCell>
                <TableCell className="text-right">{d.apr?.toFixed(2)}%</TableCell>
                <TableCell className="text-right">{fmtMoney(d.minPayment ?? 0, currency)}</TableCell>
                <TableCell>{d.dueDay ? `Day ${d.dueDay}` : "—"}</TableCell>
                <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => onDelete(d.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- Goals Components ---
function GoalForm({ onAdd, currency }: { onAdd: (g: Omit<Goal, "id">) => void; currency: string }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState(0);
  const [current, setCurrent] = useState(0);

  return (
    <div className="space-y-3">
      <Field label="Name"><Input placeholder="Emergency fund, Vacation, New laptop" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label={`Target (${currency})`}><Input type="number" inputMode="decimal" value={target} onChange={(e) => setTarget(Number(e.target.value))} /></Field>
      <Field label={`Current (${currency})`}><Input type="number" inputMode="decimal" value={current} onChange={(e) => setCurrent(Number(e.target.value))} /></Field>
      <Button className="gap-2" onClick={() => { if (!name || target <= 0) return; onAdd({ name, target, current }); }}><Plus className="h-4 w-4" />Add</Button>
    </div>
  );
}

function GoalTable({ goals, onDelete, currency }: { goals: Goal[]; onDelete: (id: string) => void; currency: string }) {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Target</TableHead>
            <TableHead className="text-right">Current</TableHead>
            <TableHead className="text-right">Progress</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goals.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No goals yet.</TableCell></TableRow>
          )}
          {goals.map((g) => {
            const pct = g.target ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
            return (
              <TableRow key={g.id}>
                <TableCell>{g.name}</TableCell>
                <TableCell className="text-right">{fmtMoney(g.target, currency)}</TableCell>
                <TableCell className="text-right">{fmtMoney(g.current, currency)}</TableCell>
                <TableCell className="text-right">{pct}%</TableCell>
                <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => onDelete(g.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// --- Planner widgets ---
function BudgetSuggest({ txns, currency }: { txns: Txn[]; currency: string }) {
  // Very simple envelope suggestion from last 3 months average
  const last3 = useMemo(() => {
    const byMonth = new Map<string, { [k: string]: number }>();
    const categories = new Set<string>();
    for (const t of txns) {
      if (t.type !== "expense") continue;
      const m = monthKey(t.date);
      categories.add(t.category);
      if (!byMonth.has(m)) byMonth.set(m, {});
      const bucket = byMonth.get(m)!;
      bucket[t.category] = (bucket[t.category] ?? 0) + t.amount;
    }
    const months = Array.from(byMonth.keys()).sort().slice(-3);
    const avg: { category: string; avg: number }[] = [];
    for (const c of Array.from(categories)) {
      const vals = months.map((m) => byMonth.get(m)?.[c] ?? 0);
      const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      if (mean > 0) avg.push({ category: c, avg: mean });
    }
    avg.sort((a, b) => b.avg - a.avg);
    return avg.slice(0, 10);
  }, [txns]);

  const total = last3.reduce((s, x) => s + x.avg, 0);

  return (
    <div className="md:col-span-3">
      <div className="text-sm mb-2 text-muted-foreground">Suggested monthly caps (based on recent spending):</div>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Cap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {last3.length === 0 && (
              <TableRow><TableCell colSpan={2} className="text-sm text-muted-foreground text-center">Add a few expenses to see suggestions.</TableCell></TableRow>
            )}
            {last3.map((x) => (
              <TableRow key={x.category}>
                <TableCell>{x.category}</TableCell>
                <TableCell className="text-right">{fmtMoney(x.avg, currency)}</TableCell>
              </TableRow>
            ))}
            {last3.length > 0 && (
              <TableRow>
                <TableCell className="font-medium">Total</TableCell>
                <TableCell className="text-right font-medium">{fmtMoney(total, currency)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DebtSimulator({ debts, currency }: { debts: Debt[]; currency: string }) {
  const [budget, setBudget] = useState(0);
  const [mode, setMode] = useState<"snowball" | "avalanche">("avalanche");
  const plan = useMemo(() => (debts.length ? computeDebtPlan(debts, budget, mode) : null), [debts, budget, mode]);

  // condensed line view: total remaining balance over months
  const chartData = useMemo(() => {
    if (!plan) return [] as { month: number; remaining: number }[];
    const months = Math.max(...plan.schedule.map((s) => s.month), 0);
    const data: { month: number; remaining: number }[] = [];
    for (let m = 0; m <= months; m++) {
      const bal = debts.reduce((sum, d) => {
        const last = [...plan.schedule].filter((x) => x.name === d.name && x.month <= m).pop();
        return sum + (last ? last.balance : d.balance);
      }, 0);
      data.push({ month: m, remaining: bal });
    }
    return data;
  }, [plan, debts]);

  const monthsToZero = useMemo(() => {
    if (!plan) return 0;
    const last = plan.schedule[plan.schedule.length - 1];
    return last ? last.month + 1 : 0;
  }, [plan]);

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-5 gap-3">
        <div className="md:col-span-1 space-y-3">
          <Field label={`Monthly Budget for Debts (${currency})`}>
            <Input type="number" inputMode="decimal" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
          </Field>
          <Field label="Strategy">
            <Select value={mode} onValueChange={(v) => setMode(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="avalanche">Avalanche (highest APR first)</SelectItem>
                <SelectItem value="snowball">Snowball (smallest balance first)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="text-sm text-muted-foreground">{monthsToZero ? `Approx. payoff time: ${monthsToZero} months` : ""}</div>
        </div>
        <div className="md:col-span-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="month" tickFormatter={(v) => `M${v}`} />
              <YAxis />
              <Tooltip formatter={(v: number) => fmtMoney(v, currency)} />
              <Line type="monotone" dataKey="remaining" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
