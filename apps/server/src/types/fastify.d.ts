import type { AuthenticatedUser } from "../modules/auth/jwt.service";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}