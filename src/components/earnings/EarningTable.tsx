import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Earning } from "@/types";
import { fmtMoney } from "@/utils/money";

export function EarningTable({ earnings, onDelete }: { earnings: Earning[]; onDelete: (id: string) => void }) {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Month</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {earnings.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                No earnings yet.
              </TableCell>
            </TableRow>
          )}
          {earnings.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{e.source}</TableCell>
              <TableCell className="whitespace-nowrap">{e.month}</TableCell>
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
