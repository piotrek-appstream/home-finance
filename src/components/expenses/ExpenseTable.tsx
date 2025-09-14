import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { RecurringExpense } from "@/types";
import { fmtMoney } from "@/utils/money";

export function ExpenseTable({ expenses, onDelete }: { expenses: RecurringExpense[]; onDelete: (id: string) => void }) {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                No monthly expenses yet.
              </TableCell>
            </TableRow>
          )}
          {expenses.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="whitespace-nowrap">{e.name}</TableCell>
              <TableCell className="text-right">{fmtMoney(e.amount)}</TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={() => onDelete(e.id)}>
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
