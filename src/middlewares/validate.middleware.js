import { z } from "zod";
import AppError from "../error/AppError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.parse({
        body: req.body,
        params: req.params,
      });
      if (result.body) req.body = result.body;
      if (result.params) req.params = result.params;

      next();
    } catch (error) {
      const message =
        error.issues
          ?.map((c) => `${c.path.join(":")} : ${c.message}`)
          .join(",") ||
        error.message ||
        "Validation error";
      next(new AppError(message, 422));
    }
  };
};
