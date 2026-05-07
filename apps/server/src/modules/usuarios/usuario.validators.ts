import { z } from "zod";

export const criarUsuarioSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve possuir pelo menos 3 caracteres."),
  email: z.string().email("E-mail inválido."),
  senha: z.string().min(6, "Senha deve possuir pelo menos 6 caracteres."),
  perfil: z.enum(["ADMIN", "ENFERMEIRO"]),
});

export const atualizarUsuarioSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve possuir pelo menos 3 caracteres.").optional(),
  email: z.string().email("E-mail inválido.").optional(),
  senha: z.string().min(6, "Senha deve possuir pelo menos 6 caracteres.").optional(),
  perfil: z.enum(["ADMIN", "ENFERMEIRO"]).optional(),
});

export const listarUsuariosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  nome: z.string().trim().optional(),
  email: z.string().trim().optional(),
  perfil: z.enum(["ADMIN_MASTER", "ADMIN", "ENFERMEIRO"]).optional(),
  ativo: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return value === "true";
    }),
});

export const alterarStatusUsuarioSchema = z.object({
  ativo: z.boolean(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>;
export type AtualizarUsuarioInput = z.infer<typeof atualizarUsuarioSchema>;
export type ListarUsuariosInput = z.infer<typeof listarUsuariosSchema>;
export type AlterarStatusUsuarioInput = z.infer<typeof alterarStatusUsuarioSchema>;