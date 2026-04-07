import { ApiResponse } from "./common";

export type QuotationItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number | null;
  unit: string | null;
};

export type Quotation = {
  id: number;
  date: string;
  qtnNo: string;
  customerName: string;
  attn: string | null;
  number: string | null;
  email: string | null;
  status: string;
  items: QuotationItem[];
};

/**
 * Data structure for creating a new Quotation
 */
export interface CreateQuotationDto {
  date?: string;
  qtnNo: string;
  customerName: string;
  attn?: string;
  number?: string;
  email?: string;
  items: Array<{
    productId: number;
    quantity: number;
    price?: number;
    unit?: string;
  }>;
}

/**
 * Response types for specific endpoints
 */
export type QuotationDetailResponse = ApiResponse<Quotation>;
export type QuotationListResponse = ApiResponse<Quotation[]>;
export type CreateQuotationResponse = ApiResponse<{ id: string }>;

/**
 * Remaining quantity calculations
 */
export interface RemainingItem {
  productId: number;
  remaining: number;
}
export type RemainingItemsResponse = ApiResponse<RemainingItem[]>;
