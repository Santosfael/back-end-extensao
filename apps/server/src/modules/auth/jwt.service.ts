import { env } from "@api-amparo-digital/env/server";
import jwt from "jsonwebtoken";

export type AuthenticatedUser = {
  id: number;
  nome: string;
  email: string;
  perfil: "ADMIN_MASTER" | "ADMIN" | "ENFERMEIRO";
};

export class JwtService {
  gerarToken(usuario: AuthenticatedUser): string {
    return jwt.sign(usuario, env.JWT_TOKEN, {
      expiresIn: "8h",
    });
  }

  verificarToken(token: string): AuthenticatedUser {
    return jwt.verify(token, env.JWT_TOKEN) as AuthenticatedUser;
  }
}