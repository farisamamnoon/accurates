import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  Quotation,
  QuotationDetailResponse,
  QuotationListResponse,
} from "@/dto/quotation";

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
