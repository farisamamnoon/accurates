import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { generatePDF } from "@/utils/generatePDF";
import { useQuotation } from "@/useQuotation";

const VAT_RATE = 0.15;

const QuotationView = () => {
  const { id } = useParams();

  const { data: quotation, isLoading, error } = useQuotation(id);

  if (!quotation) {
    return <div className="p-6">Quotation not found</div>;
  }
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading data</div>;

  // ===== map backend → your UI format =====
  const header = {
    companyName: "Accurate Management System Trading Est",
    date: quotation.date,
    to: quotation.customerName,
    attn: quotation.attn || "",
    qtn: quotation.qtnNo,
    tel: quotation.number || "",
    email: quotation.email || "",
  };

  const items =
    quotation.items?.map((item) => ({
      id: item.id,
      description: item.productName,
      qty: item.quantity,
      unit: item.unit || "Pcs",
      unitPrice: item.price || 0,
    })) ?? [];

  const terms = [
    { id: 1, text: "PAYMENT: 100% ADVANCE" },
    { id: 2, text: "VALIDITY: 5 DAYS" },
  ];

  const subtotal = items.reduce(
    (s: number, i: any) => s + i.qty * i.unitPrice,
    0,
  );
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  const fmt = (n: number) =>
    n.toLocaleString("en-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handlePrint = () => {
    generatePDF(header, items, terms);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{header.qtn}</h1>

        <Button onClick={handlePrint}>
          <FileDown className="h-4 w-4 mr-2" />
          Print / Export PDF
        </Button>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>To:</strong> {header.to}
        </div>
        <div>
          <strong>Date:</strong> {header.date}
        </div>
        <div>
          <strong>Attn:</strong> {header.attn}
        </div>
        <div>
          <strong>Tel:</strong> {header.tel}
        </div>
        <div>
          <strong>Email:</strong> {header.email}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-center">Unit</th>
              <th className="p-2 text-right">Unit Price</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i: any) => (
              <tr key={i.id} className="border-t">
                <td className="p-2">{i.description}</td>
                <td className="p-2 text-center">{i.qty}</td>
                <td className="p-2 text-center">{i.unit}</td>
                <td className="p-2 text-right">{fmt(i.unitPrice)}</td>
                <td className="p-2 text-right">{fmt(i.qty * i.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="p-4 space-y-1 text-right">
          <div>Total: {fmt(subtotal)}</div>
          <div>VAT (15%): {fmt(vat)}</div>
          <div className="font-bold text-lg">Grand Total: {fmt(total)}</div>
        </div>
      </div>

      {/* Terms */}
      <div>
        <h3 className="font-semibold mb-2">Terms & Conditions</h3>
        <ul className="list-disc ml-6 text-sm">
          {terms.map((t) => (
            <li key={t.id}>{t.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QuotationView;
