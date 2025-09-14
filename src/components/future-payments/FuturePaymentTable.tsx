import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { FuturePayment } from "@/types";
import { fmtMoney } from "@/utils/money";

export function FuturePaymentTable({ futurePayments, onDelete }: { futurePayments: FuturePayment[]; onDelete: (id: string) => void }) {
  const sorted = [...futurePayments].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Repeats</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                No future payments yet.
              </TableCell>
            </TableRow>
          )}
          {sorted.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.name}</TableCell>
              <TableCell className="text-right">{fmtMoney(d.amount)}</TableCell>
              <TableCell className="whitespace-nowrap">{d.dueDate}</TableCell>
              <TableCell className="whitespace-nowrap">{d.recurrence === "yearly" ? "Yearly" : "One-time"}</TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={() => onDelete(d.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
