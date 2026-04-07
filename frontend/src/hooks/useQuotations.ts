import {
  CreateQuotationDto,
  CreateQuotationResponse,
  Quotation,
  QuotationDetailResponse,
  QuotationListResponse,
} from "@/dto/quotation";
import { apiFetch } from "@/lib/api";
import { generatePDF } from "@/utils/generatePDF";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast"; // Ensure this path is correct

export const useQuotations = () => {
  return useQuery<QuotationListResponse, Error, Quotation[]>({
    queryKey: ["quotations"],
    queryFn: () => apiFetch("/api/quotations"),

    /**
     * Extracts the array from the API wrapper:
     * Result: { success: true, data: [...], message: "" }
     * Returned to component: [...]
     */
    select: (result) => result.data,
  });
};

export const useQuotation = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery<QuotationDetailResponse, Error, Quotation>({
    queryKey: ["quotation", id],
    queryFn: () => apiFetch(`/api/quotations/${id}`),

    /**
     * select allows you to return result.data (the Quotation)
     * directly to the component instead of the whole ApiResponse wrapper
     */
    select: (result) => result.data,

    // 🔥 use existing list data if available
    initialData: () => {
      // Look into the cache for the "all quotations" query
      const listData = queryClient.getQueryData<QuotationListResponse>([
        "quotations",
      ]);

      const found = listData?.data?.find((q) => String(q.id) === id);

      if (found) {
        // We must return the data in the shape the queryFn expects (the full ApiResponse)
        return {
          success: true,
          message: "Initial data from cache",
          data: found,
        };
      }

      return undefined;
    },
    // Prevent initialData from being treated as "stale" immediately
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(["quotations"])?.dataUpdatedAt,
  });
};

interface PdfData {
  header: any;
  items: any[];
  terms: any[];
}

export const useQuotationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateQuotationResponse,
    Error,
    { dto: CreateQuotationDto; pdfData: PdfData } // We pass both the API data and PDF data
  >({
    mutationFn: ({ dto }) =>
      apiFetch("/api/quotations", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });

      toast({
        title: "Success",
        description: `Quotation #${response.data.id} saved to database.`,
      });

      // Access the PDF data from the variables we passed to mutate
      const { header, items, terms } = variables.pdfData;
      generatePDF(header, items, terms);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save quotation",
        variant: "destructive",
      });
    },
  });
};
