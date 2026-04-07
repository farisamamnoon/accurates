import { Router, Request, Response } from "express";
import db from "../db.js";
import { validateBody } from "../middleware/validate.js";
import {
  CreateQuotationDto,
  GetParams,
  QuotationsResponse,
  RemainingItemResponse,
  CreateQuotationResponse,
  Quotation,
  QuotationResponse,
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
quotationRouter.get("/", (_, res: Response<QuotationsResponse>) => {
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
        p.name as product_name, 
        qi.quantity,
        qi.price,
        qi.unit

      FROM quotation q
      LEFT JOIN quotation_items qi 
        ON qi.quotation_id = q.id
      JOIN products p ON qi.product_id = p.id
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
        qtnNo: row.qtn_no,
        customerName: row.customer_name,
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
        productId: row.product_id,
        productName: row.product_name,
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
  (req: Request<GetParams>, res: Response<RemainingItemResponse>) => {
    const { id } = req.params;

    const rows = db
      .prepare(
        `
        SELECT 
          qi.product_id,
          qi.quantity - IFNULL(SUM(di.quantity), 0) as remaining_qty
        FROM quotation_items qi
        LEFT JOIN delivery d ON d.quotation_id = qi.quotation_id
        LEFT JOIN delivery_items di 
          ON di.delivery_id = d.id AND di.product_id = qi.product_id
        WHERE qi.quotation_id = ?
        GROUP BY qi.product_id
      `,
      )
      .all(id) as { product_id: number; remaining_qty: number }[];

    // Map database snake_case to frontend camelCase
    const data = rows.map((row) => ({
      productId: row.product_id,
      remaining: row.remaining_qty,
    }));

    res.status(200).json({
      success: true,
      data: data,
      message: "Remaining quantities calculated successfully",
    });
  },
);

// Get a single quotation by ID
quotationRouter.get(
  "/:id",
  (req: Request<GetParams>, res: Response<QuotationResponse | null>) => {
    const { id } = req.params;

    // 1. Fetch the quotation header
    const row = db
      .prepare("SELECT * FROM quotation WHERE id = ?")
      .get(id) as any;

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
        data: null,
      });
    }

    // 2. Fetch the associated items JOINED with products to get the name
    const itemsRows = db
      .prepare(
        `
        SELECT 
          qi.id, 
          qi.product_id, 
          p.name as product_name, 
          qi.quantity, 
          qi.price, 
          qi.unit 
        FROM quotation_items qi
        JOIN products p ON qi.product_id = p.id
        WHERE qi.quotation_id = ?
      `,
      )
      .all(id) as any[];

    // 3. Format the response with camelCase
    const data: Quotation = {
      id: row.id,
      date: row.date,
      qtnNo: row.qtn_no,
      customerName: row.customer_name,
      attn: row.attn,
      number: row.number,
      email: row.email,
      status: row.status,
      items: itemsRows.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name, // Now available!
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
      })),
    };

    res.status(200).json({
      success: true,
      data,
      message: "Quotation retrieved successfully",
    });
  },
);

export default quotationRouter;
