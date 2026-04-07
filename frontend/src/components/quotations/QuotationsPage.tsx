import { useQuotations } from "@/hooks/useQuotations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const VAT_RATE = 0.15;

export default function QuotationIndex() {
  const { data: quotations, isLoading } = useQuotations();

  const fmt = (n: number) =>
    n.toLocaleString("en-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">
            Manage your purchase orders and quotes.
          </p>
        </div>
        <Button asChild>
          <Link to="/quotations/create">
            <Plus className="mr-2 h-4 w-4" /> New Quotation
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px]">Ref #</TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Customer / Vendor</TableHead>
              <TableHead>Included Items</TableHead>
              <TableHead className="text-right">Total (Incl. VAT)</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading quotations...
                </TableCell>
              </TableRow>
            ) : quotations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No quotations found.
                </TableCell>
              </TableRow>
            ) : (
              quotations?.map((q) => {
                // Calculate Total for this quotation row
                const subtotal =
                  q.items?.reduce(
                    (acc, item) => acc + item.quantity * (item.price || 0),
                    0,
                  ) || 0;
                const grandTotal = subtotal * (1 + VAT_RATE);

                return (
                  <TableRow
                    key={q.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono font-bold text-primary">
                      {q.qtnNo}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {q.date}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{q.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {q.email || q.number}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 max-w-[350px]">
                        {q.items?.slice(0, 3).map((item, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[11px] font-medium px-2 py-0.5 bg-muted/50 text-foreground border-none"
                          >
                            <span className="text-primary font-bold mr-1">
                              {item.productName}
                            </span>
                            <span className="truncate max-w-[120px]">
                              ({item.quantity})
                            </span>
                          </Badge>
                        ))}
                        {q.items && q.items.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground border-dashed"
                          >
                            +{q.items.length - 3} others
                          </Badge>
                        )}
                        {(!q.items || q.items.length === 0) && (
                          <span className="text-xs text-muted-foreground italic">
                            No items added
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-base">
                      {fmt(grandTotal)}{" "}
                      <span className="text-[10px] font-normal text-muted-foreground ml-1">
                        SAR
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/quotations/${q.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
