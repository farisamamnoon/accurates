import { Request, Response, NextFunction } from "express";

export const createRoute = <T>(
  handler: (
    req: Request<any, any, T>,
    res: Response,
    next: NextFunction,
  ) => any,
) => handler;

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};
