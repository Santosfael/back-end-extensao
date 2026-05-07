import type { FastifyReply, FastifyRequest } from "fastify";
import { validate } from "../common/validation";
import { AuthService } from "./auth.service";
import { loginSchema } from "./auth.validators";

const service = new AuthService();

export async function loginController(request: FastifyRequest, reply: FastifyReply) {
  const body = validate(loginSchema, request.body);
  const result = await service.login(body);

  return reply.send(result);
}

export async function meController(request: FastifyRequest, reply: FastifyReply) {
  return reply.send({
    usuario: request.user,
  });
}