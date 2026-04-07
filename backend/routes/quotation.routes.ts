import { Router, Request, Response } from "express";
import db from "../db.js";
import { validateBody } from "../middleware/validate.js";
import {
  CreateQuotationDto,
  GetParams,
  QuotationResponse,
  RemainingItemResponse,
  CreateQuotationResponse,
  Quotation,
} from "../dto/quotation.dto.js";
import { createRoute } from "../dto/common.dto.js";

const quotationRouter = Router();

// Create quotation
quotationRouter.post(
  "/",
  validateBody(CreateQuotationDto),
  createRoute<CreateQuotationDto>(
    (req, res: Response<CreateQuotationResponse>) => {
      const { body } = req;

      const insertQuotation = db.prepare(`
      INSERT INTO quotation (date, qtn_no, customer_name, attn, number, email)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

      const insertItem = db.prepare(`
      INSERT INTO quotation_items (quotation_id, product_id, quantity, price, unit)
      VALUES (?, ?, ?, ?, ?)
    `);

      const transaction = db.transaction((data: CreateQuotationDto) => {
        const result = insertQuotation.run(
          data.date,
          data.qtnNo,
          data.customerName,
          data.attn,
          data.number,
          data.email,
        );

        const quotationId = Number(result.lastInsertRowid);

        for (const item of data.items) {
          insertItem.run(
            quotationId,
            item.productId,
            item.quantity,
            item.price ?? null,
            item.unit ?? null,
          );
        }

        return quotationId;
      });

      const insertedId = transaction(body);

      res.status(201).json({
        message: "Quotation created",
        data: { id: String(insertedId) },
        success: true,
      });
    },
  ),
);

// Get all quotations
quotationRouter.get("/", (_, res: Response<QuotationResponse>) => {
  const rows = db
    .prepare(
      `
      SELECT 
        q.id as q_id,
        q.date,
        q.qtn_no,
        q.customer_name,
        q.attn,
        q.number,
        q.email,
        q.status,

        qi.id as qi_id,
        qi.product_id,
        qi.quantity,
        qi.price,
        qi.unit

      FROM quotation q
      LEFT JOIN quotation_items qi 
        ON qi.quotation_id = q.id
      ORDER BY q.id DESC
    `,
    )
    .all() as any[];

  const map = new Map<number, Quotation>();

  for (const row of rows) {
    if (!map.has(row.q_id)) {
      map.set(row.q_id, {
        id: row.q_id,
        date: row.date,
        qtn_no: row.qtn_no,
        customer_name: row.customer_name,
        attn: row.attn,
        number: row.number,
        email: row.email,
        status: row.status,
        items: [],
      });
    }

    if (row.qi_id) {
      map.get(row.q_id)!.items.push({
        id: row.qi_id,
        product_id: row.product_id,
        quantity: row.quantity,
        price: row.price,
        unit: row.unit,
      });
    }
  }

  const quotations = Array.from(map.values());

  res.status(200).json({
    success: true,
    data: quotations,
    message: "Quotations fetched successfully",
  });
});

// Remaining quantity per quotation
quotationRouter.get(
  "/:id/remaining",
  (req: Request<GetParams>, res: Response<RemainingItemResponse[]>) => {
    const { id } = req.params;

    const remaining = db
      .prepare(
        `
        SELECT qi.product_id,
               qi.quantity - IFNULL(SUM(di.quantity), 0) as remaining
        FROM quotation_items qi
        LEFT JOIN delivery d ON d.quotation_id = qi.quotation_id
        LEFT JOIN delivery_items di 
          ON di.delivery_id = d.id AND di.product_id = qi.product_id
        WHERE qi.quotation_id = ?
        GROUP BY qi.product_id
      `,
      )
      .all(id) as RemainingItemResponse[];

    res.json(remaining);
  },
);

export default quotationRouter;
