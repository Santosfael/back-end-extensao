import type { FastifyInstance } from "fastify";
import {
  alterarStatusIdosoController,
  atualizarIdosoController,
  buscarIdosoPorIdController,
  criarIdosoController,
  listarIdososController,
} from "./idoso.controller";

export async function idosoRoutes(app: FastifyInstance) {
  app.post(
    "/idosos",
    {
      schema: {
        tags: ["Idosos"],
        summary: "Cadastrar idoso",
        body: {
          type: "object",
          required: ["nome", "dataNascimento", "rg", "cpf", "dataAdmissao"],
          properties: {
            nome: { type: "string" },
            dataNascimento: { type: "string", format: "date" },
            rg: { type: "string" },
            cpf: { type: "string" },
            dataAdmissao: { type: "string", format: "date" },
            medicamentoIds: {
              type: "array",
              items: { type: "number" },
            },
          },
        },
      },
    },
    criarIdosoController
  );

  app.get(
    "/idosos",
    {
      schema: {
        tags: ["Idosos"],
        summary: "Listar idosos",
        querystring: {
          type: "object",
          properties: {
            page: { type: "number" },
            limit: { type: "number" },
            nome: { type: "string" },
            status: { type: "string", enum: ["ATIVO", "DESLIGADO"] },
            incluirDesligados: { type: "string", enum: ["true", "false"] },
          },
        },
      },
    },
    listarIdososController
  );

  app.get(
    "/idosos/:id",
    {
      schema: {
        tags: ["Idosos"],
        summary: "Consultar idoso detalhado",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" },
          },
        },
      },
    },
    buscarIdosoPorIdController
  );

  app.put(
    "/idosos/:id",
    {
      schema: {
        tags: ["Idosos"],
        summary: "Editar cadastro do idoso",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" },
          },
        },
        body: {
          type: "object",
          properties: {
            nome: { type: "string" },
            dataNascimento: { type: "string", format: "date" },
            rg: { type: "string" },
            cpf: { type: "string" },
            dataAdmissao: { type: "string", format: "date" },
            medicamentoIds: {
              type: "array",
              items: { type: "number" },
            },
          },
        },
      },
    },
    atualizarIdosoController
  );

  app.patch(
    "/idosos/:id/status",
    {
      schema: {
        tags: ["Idosos"],
        summary: "Alterar status do idoso",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" },
          },
        },
        body: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["ATIVO", "DESLIGADO"] },
          },
        },
      },
    },
    alterarStatusIdosoController
  );
}