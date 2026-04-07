import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDeliveries } from "@/hooks/useDeliveries";

export default function DeliveryListPage() {
  const { data: deliveries, isLoading } = useDeliveries();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Purchase Deliveries
          </h1>
          <p className="text-muted-foreground">
            History of stock received from vendors.
          </p>
        </div>
        <Button asChild>
          <Link to="/delivery/create">
            <Plus className="mr-2 h-4 w-4" /> Receive Stock
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DN #</TableHead>
              <TableHead>Date Received</TableHead>
              <TableHead>Quotation/Vendor</TableHead>
              <TableHead>Products</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              deliveries?.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono font-bold text-primary">
                    DN-{d.id}
                  </TableCell>
                  <TableCell>{new Date(d.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="font-medium">{d.qtnNo}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.customerName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[400px]">
                      {d.items.map((item, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-[10px] whitespace-nowrap"
                        >
                          {item}
                        </Badge>
                      ))}
                      {d.items.length === 0 && (
                        <span className="text-muted-foreground text-xs">
                          No items
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
