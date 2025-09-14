import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Debt } from "@/types";
import { fmtMoney } from "@/utils/money";

export function DebtTable({ debts, onDelete }: { debts: Debt[]; onDelete: (id: string) => void }) {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {debts.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                No debts yet.
              </TableCell>
            </TableRow>
          )}
          {debts.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.name}</TableCell>
              <TableCell className="text-right">{fmtMoney(d.amount)}</TableCell>
              <TableCell className="whitespace-nowrap">{d.dueDate}</TableCell>
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
