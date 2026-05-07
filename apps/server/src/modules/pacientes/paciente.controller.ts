import type { FastifyReply, FastifyRequest } from "fastify";
import { validate } from "../common/validation";
import { PacienteService } from "./paciente.service";
import {
  alterarStatusPacienteSchema,
  atualizarPacienteSchema,
  criarPacienteSchema,
  idParamSchema,
  listarPacientesSchema,
} from "./paciente.validators";

const service = new PacienteService();

export async function criarPacienteController(request: FastifyRequest, reply: FastifyReply) {
  const body = validate(criarPacienteSchema, request.body);
  const result = await service.criar(body);

  return reply.status(201).send(result);
}

export async function listarPacientesController(request: FastifyRequest, reply: FastifyReply) {
  const query = validate(listarPacientesSchema, request.query);
  const result = await service.listar(query);

  return reply.send(result);
}

export async function buscarPacientePorIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const params = validate(idParamSchema, request.params);
  const result = await service.buscarPorId(params.id);

  return reply.send(result);
}

export async function atualizarPacienteController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const params = validate(idParamSchema, request.params);
  const body = validate(atualizarPacienteSchema, request.body);

  const result = await service.atualizar(params.id, body);

  return reply.send(result);
}

export async function alterarStatusPacienteController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const params = validate(idParamSchema, request.params);
  const body = validate(alterarStatusPacienteSchema, request.body);

  const result = await service.alterarStatus(params.id, body);

  return reply.send(result);
}