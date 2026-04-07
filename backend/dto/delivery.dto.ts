import {
  IsNumber,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiResponse } from "./common.dto.js";

class DeliveryItemDto {
  @Type(() => Number)
  @IsNumber()
  productId!: number;

  @Type(() => Number)
  @IsNumber()
  quantity!: number;
}

export class CreateDeliveryDto {
  @Type(() => Number)
  @IsNumber()
  quotationId!: number;

  @IsArray()
  @ArrayMinSize(1, { message: "At least one item is required" })
  @ValidateNested({ each: true })
  @Type(() => DeliveryItemDto)
  items!: DeliveryItemDto[];
}

export type CreateDeliveryResponse = ApiResponse<{ id: string }>;

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
