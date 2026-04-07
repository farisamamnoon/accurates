import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProduct } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const { mutate: createProduct, isPending } = useCreateProduct();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProduct({ name }, {
      onSuccess: () => navigate("/products")
    });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate("/products")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>New Product</CardTitle>
          <CardDescription>
            Enter the name of the new product. Initial quantity will be set to 0.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input 
                placeholder="e.g. Industrial Drill Bit" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/products")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !name}>
                {isPending ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
