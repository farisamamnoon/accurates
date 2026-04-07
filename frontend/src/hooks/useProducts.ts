import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  Product,
  ProductResponse,
  CreateProductResponse,
} from "@/dto/products";
import { toast } from "@/hooks/use-toast";

export const useProducts = () => {
  return useQuery<ProductResponse, Error, Product[]>({
    queryKey: ["products"],
    queryFn: () => apiFetch("/api/products"),
    select: (result) => result.data,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateProductResponse, Error, { name: string }>({
    mutationFn: (newProduct) =>
      apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Success", description: "Product added to inventory." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    },
  });
};
