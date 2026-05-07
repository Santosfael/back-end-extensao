import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const statusPacienteEnum = pgEnum("status_paciente", ["ATIVO", "DESLIGADO"]);

export const pacientes = pgTable(
  "pacientes",
  {
    id: serial("id").primaryKey(),
    nome: varchar("nome", { length: 150 }).notNull(),
    dataNascimento: date("data_nascimento", { mode: "date" }).notNull(),
    idade: integer("idade").notNull(),
    rg: varchar("rg", { length: 20 }).notNull(),
    cpf: varchar("cpf", { length: 11 }).notNull(),
    dataAdmissao: date("data_admissao", { mode: "date" }).notNull(),
    status: statusPacienteEnum("status").notNull().default("ATIVO"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    cpfUnique: uniqueIndex("pacientes_cpf_unique").on(table.cpf),
    rgUnique: uniqueIndex("pacientes_rg_unique").on(table.rg),
    nomeIdx: index("pacientes_nome_idx").on(table.nome),
    statusIdx: index("pacientes_status_idx").on(table.status),
  })
);

export const medicamentos = pgTable(
  "medicamentos",
  {
    id: serial("id").primaryKey(),
    nome: varchar("nome", { length: 150 }).notNull(),
    descricao: text("descricao"),
    dosagem: varchar("dosagem", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nomeIdx: index("medicamentos_nome_idx").on(table.nome),
  })
);

export const pacientesMedicamentos = pgTable(
  "pacientes_medicamentos",
  {
    pacienteId: integer("paciente_id")
      .notNull()
      .references(() => pacientes.id, { onDelete: "cascade" }),
    medicamentoId: integer("medicamento_id")
      .notNull()
      .references(() => medicamentos.id, { onDelete: "restrict" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.pacienteId, table.medicamentoId] }),
    pacienteIdx: index("pacientes_medicamentos_paciente_idx").on(table.pacienteId),
    medicamentoIdx: index("pacientes_medicamentos_medicamento_idx").on(table.medicamentoId),
  })
);

export const pacientesRelations = relations(pacientes, ({ many }) => ({
  medicamentosRelacionados: many(pacientesMedicamentos),
}));

export const medicamentosRelations = relations(medicamentos, ({ many }) => ({
  pacientesRelacionados: many(pacientesMedicamentos),
}));

export const pacientesMedicamentosRelations = relations(pacientesMedicamentos, ({ one }) => ({
  paciente: one(pacientes, {
    fields: [pacientesMedicamentos.pacienteId],
    references: [pacientes.id],
  }),
  medicamento: one(medicamentos, {
    fields: [pacientesMedicamentos.medicamentoId],
    references: [medicamentos.id],
  }),
}));

export type Paciente = typeof pacientes.$inferSelect;
export type NovoPaciente = typeof pacientes.$inferInsert;

export type Medicamento = typeof medicamentos.$inferSelect;
export type NovoMedicamento = typeof medicamentos.$inferInsert;