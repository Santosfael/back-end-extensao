import { z } from "zod";

const somenteNumeros = (value: string) => value.replace(/\D/g, "");

export function validarCpf(cpfOriginal: string): boolean {
  const cpf = somenteNumeros(cpfOriginal);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let digito1 = 11 - (soma % 11);
  if (digito1 >= 10) digito1 = 0;

  if (digito1 !== Number(cpf[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  let digito2 = 11 - (soma % 11);
  if (digito2 >= 10) digito2 = 0;

  return digito2 === Number(cpf[10]);
}

const dataNaoFutura = z.coerce.date().refine((data) => data <= new Date(), {
  message: "A data não pode ser futura.",
});

const cpfSchema = z
  .string()
  .transform(somenteNumeros)
  .refine((cpf) => cpf.length === 11, "CPF deve possuir exatamente 11 dígitos.")
  .refine(validarCpf, "CPF inválido.");

const rgSchema = z
  .string()
  .transform(somenteNumeros)
  .refine((rg) => rg.length >= 5 && rg.length <= 14, "RG deve possuir tamanho válido.");

const medicamentoIdsSchema = z
  .array(z.coerce.number().int().positive())
  .default([])
  .transform((ids) => [...new Set(ids)]);

export const criarIdosoSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve possuir pelo menos 3 caracteres."),
  dataNascimento: dataNaoFutura,
  rg: rgSchema,
  cpf: cpfSchema,
  dataAdmissao: dataNaoFutura,
  medicamentoIds: medicamentoIdsSchema,
});

export const atualizarIdosoSchema = z.object({
  nome: z.string().trim().min(3).optional(),
  dataNascimento: dataNaoFutura.optional(),
  rg: rgSchema.optional(),
  cpf: cpfSchema.optional(),
  dataAdmissao: dataNaoFutura.optional(),
  medicamentoIds: medicamentoIdsSchema.optional(),
});

export const listarIdososSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  nome: z.string().trim().optional(),
  status: z.enum(["ATIVO", "DESLIGADO"]).optional(),
  incluirDesligados: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export const alterarStatusIdosoSchema = z.object({
  status: z.enum(["ATIVO", "DESLIGADO"]),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CriarIdosoInput = z.infer<typeof criarIdosoSchema>;
export type AtualizarIdosoInput = z.infer<typeof atualizarIdosoSchema>;
export type ListarIdososInput = z.infer<typeof listarIdososSchema>;
export type AlterarStatusIdosoInput = z.infer<typeof alterarStatusIdosoSchema>;