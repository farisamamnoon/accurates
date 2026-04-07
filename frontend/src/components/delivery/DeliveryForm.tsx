import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuotations } from "@/hooks/useQuotations";
import { useProducts } from "@/hooks/useProducts";
import { useRemainingItems, useCreateDelivery } from "@/hooks/useDeliveries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DeliveryForm() {
  const navigate = useNavigate();
  const { data: quotations } = useQuotations();
  const { data: products } = useProducts();
  const [selectedQtn, setSelectedQtn] = useState<string>("");

  const { data: remaining, isLoading: loadingRemaining } =
    useRemainingItems(selectedQtn);
  const { mutate: createDelivery, isPending } = useCreateDelivery();

  const [deliveryQtys, setDeliveryQtys] = useState<Record<number, number>>({});

  const handleSubmit = () => {
    const items = Object.entries(deliveryQtys)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ productId: Number(id), quantity: qty }));

    if (items.length === 0) {
      return toast({
        title: "Error",
        description: "Enter quantity for at least one item.",
        variant: "destructive",
      });
    }

    createDelivery(
      {
        quotationId: Number(selectedQtn),
        items,
      },
      {
        onSuccess: () => {
          toast({
            title: "Stock Received",
            description: "Inventory has been updated.",
          });
          navigate("/delivery");
        },
      },
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Receive Stock from Vendor</h1>

      <div className="grid gap-6">
        <div className="bg-card p-6 border rounded-xl shadow-sm">
          <label className="text-sm font-semibold">
            Source Quotation / Purchase Order
          </label>
          <select
            className="w-full mt-2 p-2.5 bg-background border rounded-md"
            value={selectedQtn}
            onChange={(e) => {
              setSelectedQtn(e.target.value);
              setDeliveryQtys({});
            }}
          >
            <option value="">Select a reference...</option>
            {quotations?.map((q) => (
              <option key={q.id} value={q.id}>
                {q.qtnNo} — {q.customerName}
              </option>
            ))}
          </select>
        </div>

        {selectedQtn && (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Pending Items</TableHead>
                  <TableHead className="text-right w-48">
                    Quantity Received Now
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingRemaining && <p>...Loading</p>}
                {remaining?.map((item) => {
                  const productName =
                    products?.find((p) => p.id === item.productId)?.name ||
                    `ID: ${item.productId}`;
                  return (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">
                        {productName}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {item.remaining} Expected
                        </span>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={item.remaining}
                          className="text-right font-mono"
                          value={deliveryQtys[item.productId] || 0}
                          onChange={(e) =>
                            setDeliveryQtys({
                              ...deliveryQtys,
                              [item.productId]: Math.min(
                                Number(e.target.value),
                                item.remaining,
                              ),
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="p-4 bg-muted/30 flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate("/delivery")}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !selectedQtn}
              >
                {isPending
                  ? "Updating Inventory..."
                  : "Confirm & Receive Stock"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
