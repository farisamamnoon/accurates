import { ApiResponse } from "./common";

/**
 * Represents a Product record as it exists in the database.
 */
export interface Product {
  id: number;
  name: string;
  quantity: number; // Initialized to 0 by backend
}

/**
 * Data Transfer Object for creating a new product.
 * Matches the backend's CreateProductDto class-validator requirements.
 */
export interface CreateProductDto {
  name: string;
}

/**
 * Response type for fetching a single product or the creation result.
 */
export type CreateProductResponse = ApiResponse<{ id: string }>;

/**
 * Response type for fetching the list of all products.
 */
export type ProductResponse = ApiResponse<Product[]>;
