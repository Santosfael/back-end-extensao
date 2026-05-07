import bcrypt from "bcryptjs";
import { HttpError } from "../common/http-error";
import { AuthRepository } from "./auth.repository";
import { JwtService } from "./jwt.service";
import type { LoginInput } from "./auth.validators";

export class AuthService {
  private readonly repository = new AuthRepository();
  private readonly jwtService = new JwtService();

  async login(input: LoginInput) {
    const usuario = await this.repository.buscarPorEmail(input.email);

    if (!usuario) {
      throw new HttpError(401, "E-mail ou senha inválidos.");
    }

    // Usuários desativados permanecem cadastrados, mas não podem iniciar sessão.
    if (!usuario.ativo) {
      throw new HttpError(403, "Usuário inativo.");
    }

    const senhaValida = await bcrypt.compare(input.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new HttpError(401, "E-mail ou senha inválidos.");
    }

    const usuarioAutenticado = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    };

    const token = this.jwtService.gerarToken(usuarioAutenticado);

    return {
      token,
      usuario: usuarioAutenticado,
    };
  }
}
