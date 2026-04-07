import { ApiResponse } from "./common";

export interface DeliveryItem {
  productId: number;
  quantity: number;
}

/**
 * Data needed to create a new Delivery
 */
export interface CreateDeliveryDto {
  quotationId: number;
  items: DeliveryItem[];
}

/**
 * The object returned by the "Get All Deliveries" API
 */
export interface Delivery {
  id: number;
  quotationId: number;
  date: string;
  qtnNo: string; // Joined from quotation table
  customerName: string; // Joined from quotation table
  items: string[];
}


export type DeliveryListResponse = ApiResponse<Delivery[]>;
export type CreateDeliveryResponse = ApiResponse<{ id: string }>;
