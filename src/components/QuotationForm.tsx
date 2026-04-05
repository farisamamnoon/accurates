import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileDown } from "lucide-react";

interface TermItem {
  id: number;
  text: string;
}

interface LineItem {
  id: number;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

interface HeaderInfo {
  companyName: string;
  date: string;
  to: string;
  attn: string;
  qtn: string;
  tel: string;
  email: string;
}

const VAT_RATE = 0.15;

const defaultItem = (): LineItem => ({
  id: Date.now(),
  description: "",
  qty: 1,
  unit: "Pcs",
  unitPrice: 0,
});

const QuotationForm = () => {
  const [header, setHeader] = useState<HeaderInfo>({
    companyName: "Accurate Management System Trading Est",
    date: new Date().toISOString().split("T")[0],
    to: "",
    attn: "",
    qtn: "",
    tel: "",
    email: "",
  });

  const [items, setItems] = useState<LineItem[]>([defaultItem()]);

  const updateHeader = (field: keyof HeaderInfo, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = useCallback(
    (id: number, field: keyof LineItem, value: string | number) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      );
    },
    []
  );

  const addItem = () => setItems((prev) => [...prev, defaultItem()]);

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const vat = subtotal * VAT_RATE;
  const grandTotal = subtotal + vat;

  const fmt = (n: number) => n.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="mx-auto max-w-5xl rounded-xl bg-background shadow-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-primary-foreground">
          <Input
            value={header.companyName}
            onChange={(e) => updateHeader("companyName", e.target.value)}
            className="border-none bg-transparent text-2xl font-bold text-primary-foreground placeholder:text-primary-foreground/60 text-center focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Date" value={header.date} onChange={(v) => updateHeader("date", v)} type="date" />
            <InfoField label="TO" value={header.to} onChange={(v) => updateHeader("to", v)} placeholder="Company name" />
            <InfoField label="Attn" value={header.attn} onChange={(v) => updateHeader("attn", v)} placeholder="Contact person" />
            <InfoField label="QTN" value={header.qtn} onChange={(v) => updateHeader("qtn", v)} placeholder="Qtn-1001" />
            <InfoField label="Tel" value={header.tel} onChange={(v) => updateHeader("tel", v)} placeholder="+966 XX XXX XXXX" />
            <InfoField label="Email" value={header.email} onChange={(v) => updateHeader("email", v)} placeholder="email@example.com" type="email" />
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-table-header text-foreground font-semibold">
                  <th className="px-3 py-3 text-center w-14">#</th>
                  <th className="px-3 py-3 text-left">Material Description</th>
                  <th className="px-3 py-3 text-center w-20">Qty</th>
                  <th className="px-3 py-3 text-center w-24">Unit</th>
                  <th className="px-3 py-3 text-right w-28">Unit Price</th>
                  <th className="px-3 py-3 text-right w-32">Total SAR</th>
                  <th className="px-3 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-t border-border hover:bg-table-highlight transition-colors">
                    <td className="px-3 py-2 text-center text-muted-foreground font-medium">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Material description"
                        className="h-8 border-none shadow-none focus-visible:ring-1 bg-transparent"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))}
                        className="h-8 text-center border-none shadow-none focus-visible:ring-1 bg-transparent"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                        className="h-8 w-full rounded-md bg-transparent text-center text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option>Pcs</option>
                        <option>Roll</option>
                        <option>Set</option>
                        <option>Box</option>
                        <option>Kg</option>
                        <option>Ltr</option>
                        <option>Mtr</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                        className="h-8 text-right border-none shadow-none focus-visible:ring-1 bg-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{fmt(item.qty * item.unitPrice)}</td>
                    <td className="px-3 py-2 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add Row */}
            <div className="border-t border-border p-2 flex justify-center">
              <Button variant="ghost" size="sm" onClick={addItem} className="text-primary gap-1">
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-border">
              <TotalRow label="TOTAL SAR" value={fmt(subtotal)} />
              <TotalRow label="VAT 15%" value={fmt(vat)} />
              <TotalRow label="GRAND TOTAL SAR" value={fmt(grandTotal)} bold />
            </div>
          </div>

          {/* Terms & Conditions */}
          <TermsSection />

          {/* Print */}
          <div className="flex justify-end">
            <Button onClick={() => window.print()} className="gap-2">
              <FileDown className="h-4 w-4" /> Print / Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div className="flex items-center gap-3">
    <span className="w-16 text-sm font-semibold text-foreground shrink-0">{label}</span>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9"
    />
  </div>
);

const TotalRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={`flex justify-end items-center gap-8 px-6 py-2 ${bold ? "bg-total-bg" : ""}`}>
    <span className={`text-sm ${bold ? "font-bold" : "font-semibold italic"} text-foreground`}>{label}</span>
    <span className={`w-32 text-right text-sm ${bold ? "font-bold text-lg" : "font-semibold"}`}>{value}</span>
  </div>
);

export default QuotationForm;
