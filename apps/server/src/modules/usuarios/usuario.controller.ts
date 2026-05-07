import type { FastifyReply, FastifyRequest } from "fastify";
import { validate } from "../common/validation";
import { UsuarioService } from "./usuario.service";
import {
  alterarStatusUsuarioSchema,
  atualizarUsuarioSchema,
  criarUsuarioSchema,
  idParamSchema,
  listarUsuariosSchema,
} from "./usuario.validators";

const service = new UsuarioService();

export async function criarUsuarioController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = validate(criarUsuarioSchema, request.body);
  const result = await service.criar(body);

  return reply.status(201).send(result);
}

export async function listarUsuariosController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const query = validate(listarUsuariosSchema, request.query);
  const result = await service.listar(query);

  return reply.send(result);
}

export async function buscarUsuarioPorIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const params = validate(idParamSchema, request.params);
  const result = await service.buscarPorId(params.id);

  return reply.send(result);
}

export async function atualizarUsuarioController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const params = validate(idParamSchema, request.params);
  const body = validate(atualizarUsuarioSchema, request.body);

  const result = await service.atualizar(params.id, body);

  return reply.send(result);
}

export async function alterarStatusUsuarioController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const params = validate(idParamSchema, request.params);
  const body = validate(alterarStatusUsuarioSchema, request.body);

  const result = await service.alterarStatus(params.id, body);

  return reply.send(result);
}