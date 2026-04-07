import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";

const formatErrors = (errors: ValidationError[]) => {
  const result: Record<string, string[]> = {};

  const traverse = (err: ValidationError, parent?: string) => {
    const key = parent ? `${parent}.${err.property}` : err.property;

    if (err.constraints) {
      result[key] = Object.values(err.constraints);
    }

    if (err.children && err.children.length > 0) {
      err.children.forEach((child) => traverse(child, key));
    }
  };

  errors.forEach((err) => traverse(err));

  return result;
};

export const validateBody = <T>(DtoClass: ClassConstructor<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(DtoClass, req.body);

    const errors = await validate(dto as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: formatErrors(errors),
      });
    }

    req.body = dto;
    next();
  };
};
