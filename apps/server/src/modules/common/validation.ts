import type { ZodSchema } from "zod";
import { HttpError } from "./http-error";

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new HttpError(400, message || "Dados inválidos.");
  }

  return result.data;
}