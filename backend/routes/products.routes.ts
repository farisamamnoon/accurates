import { Router, Response } from "express";
import db from "../db.js";
import {
  CreateProductDto,
  CreateProductResponse,
  Product,
  ProductResponse,
} from "../dto/products.dto.js";
import { createRoute } from "../dto/common.dto.js";
import { validateBody } from "../middleware/validate.js";

const productRouter = Router();

// Get all products
productRouter.get("/", (_, res: Response<ProductResponse>) => {
  const products = db.prepare("SELECT * FROM products").all() as Product[];
  res.status(200).json({
    message: "Products fetched successfully",
    data: products,
    success: true,
  });
});

// Create product
productRouter.post(
  "/",
  validateBody(CreateProductDto),
  createRoute<CreateProductDto>((req, res: Response<CreateProductResponse>) => {
    const { name } = req.body;

    const result = db
      .prepare("INSERT INTO products (name, quantity) VALUES (?, 0)")
      .run(name);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: {
        id: String(result.lastInsertRowid),
      },
    });
  }),
);

export default productRouter;
