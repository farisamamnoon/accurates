import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  CreateDeliveryDto,
  CreateDeliveryResponse,
  Delivery,
  DeliveryListResponse,
} from "@/dto/delivery";
import { RemainingItem, RemainingItemsResponse } from "@/dto/quotation";

export const useRemainingItems = (quotationId: string | number) => {
  return useQuery<RemainingItemsResponse, Error, RemainingItem[]>({
    queryKey: ["quotation", quotationId, "remaining"],
    queryFn: async () => {
      const res = await apiFetch(`/api/quotations/${quotationId}/remaining`);
      return res; // Your backend returns the array directly based on your provided code
    },
    enabled: !!quotationId,
    select: (result) => result.data,
  });
};

export const useCreateDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateDeliveryResponse, Error, CreateDeliveryDto>({
    mutationFn: (dto) =>
      apiFetch("/api/delivery", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
};

export const useDeliveries = () => {
  return useQuery<DeliveryListResponse, Error, Delivery[]>({
    queryKey: ["deliveries"],
    queryFn: () => apiFetch("/api/delivery"),
    // Using select to unwrap the data property from ApiResponse
    select: (result) => result.data,
  });
};
