import bcrypt from "bcryptjs";
import { HttpError } from "../common/http-error";
import { UsuarioRepository } from "./usuario.repository";
import type {
  AlterarStatusUsuarioInput,
  AtualizarUsuarioInput,
  CriarUsuarioInput,
  ListarUsuariosInput,
} from "./usuario.validators";

export class UsuarioService {
  private readonly repository = new UsuarioRepository();

  async criar(input: CriarUsuarioInput) {
    const emailNormalizado = input.email.toLowerCase().trim();

    const duplicado = await this.repository.buscarDuplicidade({
      email: emailNormalizado,
    });

    if (duplicado) {
      throw new HttpError(409, "Já existe um usuário cadastrado com este e-mail.");
    }

    const senhaHash = await bcrypt.hash(input.senha, 10);

    return this.repository.criar({
      nome: input.nome,
      email: emailNormalizado,
      senhaHash,
      perfil: input.perfil,
      ativo: true,
    });
  }

  async listar(input: ListarUsuariosInput) {
    return this.repository.listar(input);
  }

  async buscarPorId(id: number) {
    const usuario = await this.repository.buscarPorId(id);

    if (!usuario) {
      throw new HttpError(404, "Usuário não encontrado.");
    }

    return usuario;
  }

  async atualizar(id: number, input: AtualizarUsuarioInput) {
    const existente = await this.repository.buscarPorIdComSenha(id);

    if (!existente) {
      throw new HttpError(404, "Usuário não encontrado.");
    }

    const emailNormalizado = input.email?.toLowerCase().trim();

    if (emailNormalizado) {
      const duplicado = await this.repository.buscarDuplicidade({
        email: emailNormalizado,
        ignorarId: id,
      });

      if (duplicado) {
        throw new HttpError(409, "Já existe outro usuário cadastrado com este e-mail.");
      }
    }

    const senhaHash = input.senha ? await bcrypt.hash(input.senha, 10) : undefined;

    const atualizado = await this.repository.atualizar(id, {
      nome: input.nome,
      email: emailNormalizado,
      senhaHash,
      perfil: input.perfil,
    });

    if (!atualizado) {
      throw new HttpError(404, "Usuário não encontrado.");
    }

    return atualizado;
  }

  async alterarStatus(id: number, input: AlterarStatusUsuarioInput) {
    const existente = await this.repository.buscarPorId(id);

    if (!existente) {
      throw new HttpError(404, "Usuário não encontrado.");
    }

    const atualizado = await this.repository.alterarStatus(id, input.ativo);

    if (!atualizado) {
      throw new HttpError(404, "Usuário não encontrado.");
    }

    return atualizado;
  }
}