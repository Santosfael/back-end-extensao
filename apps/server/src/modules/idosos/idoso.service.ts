import { HttpError } from "../common/http-error";
import { IdosoRepository } from "./idoso.repository";
import type {
  AlterarStatusIdosoInput,
  AtualizarIdosoInput,
  CriarIdosoInput,
  ListarIdososInput,
} from "./idoso.validators";

function calcularIdade(dataNascimento: Date): number {
  const hoje = new Date();

  let idade = hoje.getFullYear() - dataNascimento.getFullYear();

  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();

  const mesNascimento = dataNascimento.getMonth();
  const diaNascimento = dataNascimento.getDate();

  if (
    mesAtual < mesNascimento ||
    (mesAtual === mesNascimento && diaAtual < diaNascimento)
  ) {
    idade--;
  }

  return idade;
}

export class IdosoService {
  private readonly repository = new IdosoRepository();

  async criar(input: CriarIdosoInput) {
    const duplicado = await this.repository.buscarDuplicidade({
      cpf: input.cpf,
      rg: input.rg,
    });

    if (duplicado?.cpf === input.cpf) {
      throw new HttpError(409, "Já existe um idoso cadastrado com este CPF.");
    }

    if (duplicado?.rg === input.rg) {
      throw new HttpError(409, "Já existe um idoso cadastrado com este RG.");
    }

    const medicamentosExistem = await this.repository.validarMedicamentosExistem(
      input.medicamentoIds
    );

    if (!medicamentosExistem) {
      throw new HttpError(404, "Um ou mais medicamentos informados não foram encontrados.");
    }

    const idoso = await this.repository.criar(
      {
        nome: input.nome,
        dataNascimento: input.dataNascimento,
        idade: calcularIdade(input.dataNascimento),
        rg: input.rg,
        cpf: input.cpf,
        dataAdmissao: input.dataAdmissao,
        status: "ATIVO",
      },
      input.medicamentoIds
    );

    return this.repository.buscarDetalhadoPorId(idoso.id);
  }

  async listar(input: ListarIdososInput) {
    return this.repository.listar(input);
  }

  async buscarPorId(id: number) {
    const idoso = await this.repository.buscarDetalhadoPorId(id);

    if (!idoso) {
      throw new HttpError(404, "Idoso não encontrado.");
    }

    return idoso;
  }

  async atualizar(id: number, input: AtualizarIdosoInput) {
    const existente = await this.repository.buscarPorId(id);

    if (!existente) {
      throw new HttpError(404, "Idoso não encontrado.");
    }

    if (input.cpf || input.rg) {
      const duplicado = await this.repository.buscarDuplicidade({
        cpf: input.cpf,
        rg: input.rg,
        ignorarId: id,
      });

      if (duplicado?.cpf === input.cpf) {
        throw new HttpError(409, "Já existe outro idoso cadastrado com este CPF.");
      }

      if (duplicado?.rg === input.rg) {
        throw new HttpError(409, "Já existe outro idoso cadastrado com este RG.");
      }
    }

    if (input.medicamentoIds) {
      const medicamentosExistem = await this.repository.validarMedicamentosExistem(
        input.medicamentoIds
      );

      if (!medicamentosExistem) {
        throw new HttpError(404, "Um ou mais medicamentos informados não foram encontrados.");
      }
    }

    const dataNascimento = input.dataNascimento ?? existente.dataNascimento;

    await this.repository.atualizar(
      id,
      {
        nome: input.nome,
        dataNascimento: input.dataNascimento,
        idade: calcularIdade(dataNascimento),
        rg: input.rg,
        cpf: input.cpf,
        dataAdmissao: input.dataAdmissao,
      },
      input.medicamentoIds
    );

    return this.buscarPorId(id);
  }

  async alterarStatus(id: number, input: AlterarStatusIdosoInput) {
    const existente = await this.repository.buscarPorId(id);

    if (!existente) {
      throw new HttpError(404, "Idoso não encontrado.");
    }

    const atualizado = await this.repository.alterarStatus(id, input.status);

    if (!atualizado) {
      throw new HttpError(404, "Idoso não encontrado.");
    }

    return atualizado;
  }
}