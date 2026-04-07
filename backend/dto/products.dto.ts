import { ApiResponse } from "./common.dto.js";
import { IsString, MinLength } from "class-validator";

export class CreateProductDto {
  @IsString()
  @MinLength(1, { message: "Product name is required" })
  name!: string;
}

export type Product = {
  id: number;
  name: string;
  quantity: number;
};

export type CreateProductResponse = ApiResponse<{ id: string }>;

export type ProductResponse = ApiResponse<Product[]>;
