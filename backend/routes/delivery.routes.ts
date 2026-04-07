import { Router, Response } from "express";
import db from "../db.js";
import { validateBody } from "../middleware/validate.js";
import {
  CreateDeliveryDto,
  CreateDeliveryResponse,
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

export default deliveryRouter;
