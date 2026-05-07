import type { FastifyReply, FastifyRequest } from "fastify";
import { validate } from "../common/validation";
import { IdosoService } from "./idoso.service";
import {
  alterarStatusIdosoSchema,
  atualizarIdosoSchema,
  criarIdosoSchema,
  idParamSchema,
  listarIdososSchema,
} from "./idoso.validators";

const service = new IdosoService();

export async function criarIdosoController(request: FastifyRequest, reply: FastifyReply) {
  const body = validate(criarIdosoSchema, request.body);
  const result = await service.criar(body);

  return reply.status(201).send(result);
}

export async function listarIdososController(request: FastifyRequest, reply: FastifyReply) {
  const query = validate(listarIdososSchema, request.query);
  const result = await service.listar(query);

  return reply.send(result);
}

export async function buscarIdosoPorIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const params = validate(idParamSchema, request.params);
  const result = await service.buscarPorId(params.id);

  return reply.send(result);
}

export async function atualizarIdosoController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const params = validate(idParamSchema, request.params);
  const body = validate(atualizarIdosoSchema, request.body);

  const result = await service.atualizar(params.id, body);

  return reply.send(result);
}

export async function alterarStatusIdosoController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const params = validate(idParamSchema, request.params);
  const body = validate(alterarStatusIdosoSchema, request.body);

  const result = await service.alterarStatus(params.id, body);

  return reply.send(result);
}