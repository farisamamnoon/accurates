import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiResponse } from "./common.dto.js";

export class QuotationItemDto {
  @IsNumber()
  productId!: number;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateQuotationDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsString()
  qtnNo!: string;

  @IsString()
  customerName!: string;

  @IsOptional()
  @IsString()
  attn?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items!: QuotationItemDto[];
}

export type GetParams = {
  id: string; // comes as string from URL
};

export type RemainingItemResponse = ApiResponse<{
  productId: number;
  remaining: number;
}[]>;

export type QuotationItem = {
  id: number;
  productId: number;
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

export type QuotationsResponse = ApiResponse<Quotation[]>;

export type CreateQuotationResponse = ApiResponse<{ id: string }>;

export type QuotationResponse = ApiResponse<Quotation | null>;
