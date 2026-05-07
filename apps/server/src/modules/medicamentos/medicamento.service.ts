import { MedicamentoRepository } from "./medicamento.repository";
import type {
  CriarMedicamentoInput,
  ListarMedicamentosInput,
} from "./medicamento.validators";

export class MedicamentoService {
  private readonly repository = new MedicamentoRepository();

  async criar(input: CriarMedicamentoInput) {
    return this.repository.criar({
      nome: input.nome,
      descricao: input.descricao,
      dosagem: input.dosagem,
    });
  }

  async listar(input: ListarMedicamentosInput) {
    return this.repository.listar(input);
  }
}