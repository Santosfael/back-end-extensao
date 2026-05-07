import type { FastifyInstance } from "fastify";
import {
  alterarStatusPacienteController,
  atualizarPacienteController,
  buscarPacientePorIdController,
  criarPacienteController,
  listarPacientesController,
} from "./paciente.controller";

export async function pacienteRoutes(app: FastifyInstance) {
  app.post(
    "/pacientes",
    {
      schema: {
        tags: ["Pacientes"],
        summary: "Cadastrar paciente",
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
    criarPacienteController
  );

  app.get(
    "/pacientes",
    {
      schema: {
        tags: ["Pacientes"],
        summary: "Listar pacientes",
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
    listarPacientesController
  );

  app.get(
    "/pacientes/:id",
    {
      schema: {
        tags: ["Pacientes"],
        summary: "Consultar paciente detalhado",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" },
          },
        },
      },
    },
    buscarPacientePorIdController
  );

  app.put(
    "/pacientes/:id",
    {
      schema: {
        tags: ["Pacientes"],
        summary: "Editar cadastro do paciente",
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
    atualizarPacienteController
  );

  app.patch(
    "/pacientes/:id/status",
    {
      schema: {
        tags: ["Pacientes"],
        summary: "Alterar status do paciente",
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
    alterarStatusPacienteController
  );
}