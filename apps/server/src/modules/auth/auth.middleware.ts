import type { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../common/http-error";
import { JwtService } from "./jwt.service";

const jwtService = new JwtService();

export async function autenticar(request: FastifyRequest, _reply: FastifyReply) {
  const authorization = request.headers.authorization;

  if (!authorization) {
    throw new HttpError(401, "Token não informado.");
  }

  const [tipo, token] = authorization.split(" ");

  if (tipo !== "Bearer" || !token) {
    throw new HttpError(401, "Token inválido.");
  }

  try {
    request.user = jwtService.verificarToken(token);
  } catch {
    throw new HttpError(401, "Token inválido ou expirado.");
  }
}