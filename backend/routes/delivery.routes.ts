import { Router, Response } from "express";
import db from "../db.js";
import { validateBody } from "../middleware/validate.js";
import {
  CreateDeliveryDto,
  CreateDeliveryResponse,
  Delivery,
  DeliveryListResponse,
} from "../dto/delivery.dto.js";
import { createRoute } from "../dto/common.dto.js";

const deliveryRouter = Router();

// Create delivery
deliveryRouter.post(
  "/",
  validateBody(CreateDeliveryDto),
  createRoute<CreateDeliveryDto>(
    (req, res: Response<CreateDeliveryResponse>) => {
      const insertDelivery = db.prepare(`
      INSERT INTO delivery (quotation_id)
      VALUES (?)
    `);

      const insertItem = db.prepare(`
      INSERT INTO delivery_items (delivery_id, product_id, quantity)
      VALUES (?, ?, ?)
    `);

      const updateStock = db.prepare(`
      UPDATE products SET quantity = quantity + ?
      WHERE id = ?
    `);

      // 🔥 SINGLE TRANSACTION (important fix)
      const transaction = db.transaction((data: CreateDeliveryDto) => {
        const deliveryResult = insertDelivery.run(data.quotationId);
        const deliveryId = Number(deliveryResult.lastInsertRowid);

        for (const item of data.items) {
          insertItem.run(deliveryId, item.productId, item.quantity);

          // update inventory
          updateStock.run(item.quantity, item.productId);
        }

        return deliveryId;
      });

      const deliveryId = transaction(req.body);

      res.status(201).json({
        success: true,
        message: "Delivery created and inventory updated",
        data: { id: String(deliveryId) },
      });
    },
  ),
);

// Get All Deliveries
// deliveryRouter.ts
deliveryRouter.get("/", (_, res: Response<DeliveryListResponse>) => {
  const rows = db
    .prepare(
      `
    SELECT 
      d.id, 
      d.quotation_id, 
      d.created_at, 
      q.qtn_no, 
      q.customer_name,
      -- Aggregate items into a JSON-like string or comma-separated list
      (
        SELECT GROUP_CONCAT(p.name || ' (x' || di.quantity || ')')
        FROM delivery_items di
        JOIN products p ON di.product_id = p.id
        WHERE di.delivery_id = d.id
      ) as items_summary
    FROM delivery d
    JOIN quotation q ON d.quotation_id = q.id
    ORDER BY d.id DESC
  `,
    )
    .all() as any[];

  const deliveries: Delivery[] = rows.map((row) => ({
    id: row.id,
    quotationId: row.quotation_id,
    date: row.created_at,
    qtnNo: row.qtn_no,
    customerName: row.customer_name,
    // Split the concatenated string into an array for the UI
    items: row.items_summary ? row.items_summary.split(",") : [],
  }));

  res.status(200).json({
    success: true,
    data: deliveries,
    message: "Deliveries fetched successfully",
  });
});

export default deliveryRouter;
