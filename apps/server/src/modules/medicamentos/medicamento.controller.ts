import type { FastifyReply, FastifyRequest } from "fastify";
import { validate } from "../common/validation";
import { MedicamentoService } from "./medicamento.service";
import {
  criarMedicamentoSchema,
  listarMedicamentosSchema,
} from "./medicamento.validators";

const service = new MedicamentoService();

export async function criarMedicamentoController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = validate(criarMedicamentoSchema, request.body);
  const result = await service.criar(body);

  return reply.status(201).send(result);
}

export async function listarMedicamentosController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const query = validate(listarMedicamentosSchema, request.query);
  const result = await service.listar(query);

  return reply.send(result);
}