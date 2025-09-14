import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DebtSim } from "@/utils/planning";
import { Badge } from "@/components/ui/badge";
import { fmtMoney } from "@/utils/money";

export function DebtsSchedule({ debts }: { debts: DebtSim[] }) {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Debt</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Funded By</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {debts.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No debts.</TableCell>
            </TableRow>
          )}
          {debts.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="whitespace-nowrap">{d.name}</TableCell>
              <TableCell className="whitespace-nowrap">{d.dueDate}</TableCell>
              <TableCell>{fmtMoney(d.amount)}</TableCell>
              <TableCell>{d.fundedBy === null ? `Not fundable` : d.fundedBy}</TableCell>
              <TableCell>
                {d.onTime ? (
                  <Badge variant="secondary">On time</Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Late</Badge>
                    {d.shortfallAtDueDate.value > 0 && (
                      <span className="text-xs text-muted-foreground">Shortfall: {fmtMoney(d.shortfallAtDueDate)}</span>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
