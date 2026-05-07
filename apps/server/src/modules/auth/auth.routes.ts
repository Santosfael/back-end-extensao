import type { FastifyInstance } from "fastify";
import { autenticar } from "./auth.middleware";
import { loginController, meController } from "./auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/auth/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Realizar login",
        body: {
          type: "object",
          required: ["email", "senha"],
          properties: {
            email: { type: "string" },
            senha: { type: "string" },
          },
        },
      },
    },
    loginController
  );

  app.get(
    "/auth/me",
    {
      preHandler: autenticar,
      schema: {
        tags: ["Auth"],
        summary: "Consultar usuário autenticado",
      },
    },
    meController
  );
}