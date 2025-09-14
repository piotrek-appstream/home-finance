import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Saving } from "@/types";
import { fmtMoney } from "@/utils/money";

export function SavingTable({ savings, onDelete }: { savings: Saving[]; onDelete: (id: string) => void }) {
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
          {savings.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                No savings yet.
              </TableCell>
            </TableRow>
          )}
          {savings.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="whitespace-nowrap">{s.name}</TableCell>
              <TableCell className="text-right">{fmtMoney(s.amount)}</TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={() => onDelete(s.id)}>
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

