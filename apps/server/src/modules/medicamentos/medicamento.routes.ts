import type { FastifyInstance } from "fastify";
import {
  criarMedicamentoController,
  listarMedicamentosController,
} from "./medicamento.controller";

export async function medicamentoRoutes(app: FastifyInstance) {
  app.post(
    "/medicamentos",
    {
      schema: {
        tags: ["Medicamentos"],
        summary: "Cadastrar medicamento",
        body: {
          type: "object",
          required: ["nome"],
          properties: {
            nome: { type: "string" },
            descricao: { type: "string" },
            dosagem: { type: "string" },
          },
        },
      },
    },
    criarMedicamentoController
  );

  app.get(
    "/medicamentos",
    {
      schema: {
        tags: ["Medicamentos"],
        summary: "Listar medicamentos",
        querystring: {
          type: "object",
          properties: {
            nome: { type: "string" },
          },
        },
      },
    },
    listarMedicamentosController
  );
}