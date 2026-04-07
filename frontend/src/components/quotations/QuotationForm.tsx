import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import logoImg from "@/assets/accurate-logo.png";
import { CreateQuotationDto } from "@/dto/quotation";
import { useQuotationMutation } from "@/hooks/useQuotations";
import { useProducts } from "@/hooks/useProducts";

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
  const { data: products } = useProducts();
  const { mutate: createQuotation, isPending } = useQuotationMutation();

  const [items, setItems] = useState<LineItem[]>([defaultItem()]);
  const [terms, setTerms] = useState<TermItem[]>([
    { id: 1, text: "PAYMENT: 100% ADVANCE" },
    { id: 2, text: "VALIDITY: 5 DAYS" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateHeader = (field: keyof HeaderInfo, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateItem = useCallback(
    (id: number, field: keyof LineItem, value: string | number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      );
      setErrors((prev) => {
        const key = `item_${id}_${field}`;
        if (prev[key]) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    },
    [],
  );

  const addItem = () => setItems((prev) => [...prev, defaultItem()]);

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!header.to.trim()) newErrors.to = "Required";
    if (!header.attn.trim()) newErrors.attn = "Required";
    if (!header.tel.trim()) newErrors.tel = "Required";
    if (!header.email.trim()) newErrors.email = "Required";

    items.forEach((item) => {
      if (!item.description.trim())
        newErrors[`item_${item.id}_description`] = "Required";
      if (item.qty <= 0) newErrors[`item_${item.id}_qty`] = "Required";
      if (item.unitPrice <= 0)
        newErrors[`item_${item.id}_unitPrice`] = "Required";
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (validate()) {
      // Map local state to Backend DTO
      const dto: CreateQuotationDto = {
        date: header.date,
        qtnNo: header.qtn,
        customerName: header.to,
        attn: header.attn,
        number: header.tel,
        email: header.email,
        items: items.map((item) => {
          // 4. Find the actual product ID from the description (or store it in state)
          const product = products?.find((p) => p.name === item.description);
          return {
            productId: product ? Number(product.id) : 0,
            quantity: item.qty,
            price: item.unitPrice,
            unit: item.unit,
          };
        }),
      };

      createQuotation({
        dto,
        pdfData: { header, items, terms },
      });
    }
  };

  // Terms helpers
  const addTerm = () =>
    setTerms((prev) => [...prev, { id: Date.now(), text: "" }]);
  const updateTerm = (id: number, text: string) =>
    setTerms((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  const removeTerm = (id: number) => {
    if (terms.length === 1) return;
    setTerms((prev) => prev.filter((t) => t.id !== id));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0,
  );
  const vat = subtotal * VAT_RATE;
  const grandTotal = subtotal + vat;
  const fmt = (n: number) =>
    n.toLocaleString("en-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleProductSelect = (itemId: number, productId: string) => {
    const selectedProduct = products?.find((p) => String(p.id) === productId);
    if (selectedProduct) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                description: selectedProduct.name,
                // If you had price/unit in product table, you'd set them here
              }
            : item,
        ),
      );
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="mx-auto max-w-5xl rounded-xl bg-background shadow-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-primary-foreground flex items-center gap-4">
          <img
            src={logoImg}
            alt="Company Logo"
            className="h-14 w-14 rounded-md bg-white/10 object-contain p-1"
          />
          <Input
            value={header.companyName}
            onChange={(e) => updateHeader("companyName", e.target.value)}
            className="border-none bg-transparent text-2xl font-bold text-primary-foreground placeholder:text-primary-foreground/60 text-center focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="Date"
              value={header.date}
              onChange={(v) => updateHeader("date", v)}
              type="date"
            />
            <InfoField
              label="TO"
              value={header.to}
              onChange={(v) => updateHeader("to", v)}
              placeholder="Company name"
              required
              error={errors.to}
            />
            <InfoField
              label="Attn"
              value={header.attn}
              onChange={(v) => updateHeader("attn", v)}
              placeholder="Contact person"
              required
              error={errors.attn}
            />
            <InfoField
              label="QTN"
              value={header.qtn}
              onChange={(v) => updateHeader("qtn", v)}
              placeholder="Qtn-1001"
            />
            <InfoField
              label="Tel"
              value={header.tel}
              onChange={(v) => updateHeader("tel", v)}
              placeholder="+966 XX XXX XXXX"
              required
              error={errors.tel}
            />
            <InfoField
              label="Email"
              value={header.email}
              onChange={(v) => updateHeader("email", v)}
              placeholder="email@example.com"
              type="email"
              required
              error={errors.email}
            />
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-table-header text-foreground font-semibold">
                  <th className="px-3 py-3 text-center w-14">#</th>
                  <th className="px-3 py-3 text-left">
                    Material Description{" "}
                    <span className="text-destructive">*</span>
                  </th>
                  <th className="px-3 py-3 text-center w-20">
                    Qty <span className="text-destructive">*</span>
                  </th>
                  <th className="px-3 py-3 text-center w-24">Unit</th>
                  <th className="px-3 py-3 text-right w-28">
                    Unit Price <span className="text-destructive">*</span>
                  </th>
                  <th className="px-3 py-3 text-right w-32">Total SAR</th>
                  <th className="px-3 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-t border-border hover:bg-table-highlight transition-colors"
                  >
                    <td className="px-3 py-2 text-center text-muted-foreground font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className={`h-8 w-full rounded-md bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring ${
                          errors[`item_${item.id}_description`]
                            ? "ring-1 ring-destructive"
                            : ""
                        }`}
                        value={
                          products?.find((p) => p.name === item.description)
                            ?.id || ""
                        }
                        onChange={(e) =>
                          handleProductSelect(item.id, e.target.value)
                        }
                      >
                        <option value="">Select a product...</option>
                        {products?.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.quantity})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(item.id, "qty", Number(e.target.value))
                        }
                        className={`h-8 text-center border-none shadow-none focus-visible:ring-1 bg-transparent ${errors[`item_${item.id}_qty`] ? "ring-1 ring-destructive" : ""}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.unit}
                        onChange={(e) =>
                          updateItem(item.id, "unit", e.target.value)
                        }
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
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "unitPrice",
                            Number(e.target.value),
                          )
                        }
                        className={`h-8 text-right border-none shadow-none focus-visible:ring-1 bg-transparent ${errors[`item_${item.id}_unitPrice`] ? "ring-1 ring-destructive" : ""}`}
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {fmt(item.qty * item.unitPrice)}
                    </td>
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

            <div className="border-t border-border p-2 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={addItem}
                className="text-primary gap-1"
              >
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="border-t-2 border-border">
              <TotalRow label="TOTAL SAR" value={fmt(subtotal)} />
              <TotalRow label="VAT 15%" value={fmt(vat)} />
              <TotalRow label="GRAND TOTAL SAR" value={fmt(grandTotal)} bold />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="gap-2"
              disabled={isPending}
            >
              {isPending ? (
                "Saving..."
              ) : (
                <>
                  <FileDown className="h-4 w-4" /> Submit & Export PDF
                </>
              )}
            </Button>
          </div>

          {/* Terms & Conditions — bottom */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-table-header px-4 py-2">
              <h3 className="text-sm font-semibold text-foreground">
                Terms & Conditions
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {terms.map((term, idx) => (
                <div key={term.id} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-6 shrink-0">
                    {idx + 1}.
                  </span>
                  <Input
                    value={term.text}
                    onChange={(e) => updateTerm(term.id, e.target.value)}
                    placeholder="Enter term..."
                    className="h-8 flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeTerm(term.id)}
                    disabled={terms.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={addTerm}
                className="text-primary gap-1 mt-1"
              >
                <Plus className="h-4 w-4" /> Add Term
              </Button>
            </div>
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
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
}) => (
  <div className="flex items-center gap-3">
    <span className="w-16 text-sm font-semibold text-foreground shrink-0">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </span>
    <div className="flex-1">
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-9 ${error ? "border-destructive ring-1 ring-destructive" : ""}`}
      />
    </div>
  </div>
);

const TotalRow = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <div
    className={`flex justify-end items-center gap-8 px-6 py-2 ${bold ? "bg-total-bg" : ""}`}
  >
    <span
      className={`text-sm ${bold ? "font-bold" : "font-semibold italic"} text-foreground`}
    >
      {label}
    </span>
    <span
      className={`w-32 text-right text-sm ${bold ? "font-bold text-lg" : "font-semibold"}`}
    >
      {value}
    </span>
  </div>
);

export default QuotationForm;
