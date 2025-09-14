import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FuturePaymentSim } from "@/utils/planning";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fmtMoney } from "@/utils/money";

export function FuturePaymentsSchedule({ futurePayments }: { futurePayments: FuturePaymentSim[] }) {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Future Payment</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Funded By</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {futurePayments.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No future payments.</TableCell>
            </TableRow>
          )}
          {futurePayments.map((d) => (
            <TableRow key={d.id} className={cn(!d.id.includes("#") && "font-semibold")}> 
              <TableCell className="whitespace-nowrap">{d.name}</TableCell>
              <TableCell className="whitespace-nowrap">{d.dueDate}</TableCell>
              <TableCell>{fmtMoney(d.amount)}</TableCell>
              <TableCell>{d.fundedBy === null ? `Not fundable` : d.fundedBy}</TableCell>
              <TableCell className="font-normal">
                {d.onTime ? (
                  <Badge className="font-normal" variant="secondary">On time</Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className="font-normal" variant="destructive">Late</Badge>
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
