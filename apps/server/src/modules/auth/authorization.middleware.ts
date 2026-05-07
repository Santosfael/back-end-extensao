import type { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../common/http-error";
import type { AuthenticatedUser } from "./jwt.service";

type PerfilUsuario = AuthenticatedUser["perfil"];

export function autorizarPerfis(perfisPermitidos: PerfilUsuario[]) {
  return async function (request: FastifyRequest, _reply: FastifyReply) {
    const usuario = request.user;

    if (!usuario) {
      throw new HttpError(401, "Usuário não autenticado.");
    }

    if (!perfisPermitidos.includes(usuario.perfil)) {
      throw new HttpError(403, "Usuário não possui permissão para executar esta ação.");
    }
  };
}