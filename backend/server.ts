import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import quotationRouter from "./routes/quotation.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import productRouter from "./routes/products.routes.js";
import { ApiResponse } from "./dto/common.dto.js";

const app = express();

// ===== Middleware =====
app.use((req, _, next) => {
  console.log(req.method, req.url);
  next();
});
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ===== Routes =====
app.get("/", (_, res: Response) => {
  res.send("API is running...");
});

app.get("/api/health", (_, res: Response) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/quotations", quotationRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/products", productRouter);

// ===== 404 Handler =====
app.use((_, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// ===== Error Handler =====
app.use(
  (
    err: any,
    _: Request,
    res: Response<ApiResponse<null>>,
    __: NextFunction,
  ) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      data: null,
    });
  },
);

// ===== Server =====
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
