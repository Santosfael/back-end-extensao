import { z } from "zod";

export const criarMedicamentoSchema = z.object({
  nome: z.string().trim().min(2, "Nome do medicamento é obrigatório."),
  descricao: z.string().trim().optional(),
  dosagem: z.string().trim().optional(),
});

export const listarMedicamentosSchema = z.object({
  nome: z.string().trim().optional(),
});

export type CriarMedicamentoInput = z.infer<typeof criarMedicamentoSchema>;
export type ListarMedicamentosInput = z.infer<typeof listarMedicamentosSchema>;