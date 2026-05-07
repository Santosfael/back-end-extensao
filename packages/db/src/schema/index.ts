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

export const statusIdosoEnum = pgEnum("status_idoso", ["ATIVO", "DESLIGADO"]);

export const idosos = pgTable(
  "idosos",
  {
    id: serial("id").primaryKey(),
    nome: varchar("nome", { length: 150 }).notNull(),
    dataNascimento: date("data_nascimento", { mode: "date" }).notNull(),
    idade: integer("idade").notNull(),
    rg: varchar("rg", { length: 20 }).notNull(),
    cpf: varchar("cpf", { length: 11 }).notNull(),
    dataAdmissao: date("data_admissao", { mode: "date" }).notNull(),
    status: statusIdosoEnum("status").notNull().default("ATIVO"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    cpfUnique: uniqueIndex("idosos_cpf_unique").on(table.cpf),
    rgUnique: uniqueIndex("idosos_rg_unique").on(table.rg),
    nomeIdx: index("idosos_nome_idx").on(table.nome),
    statusIdx: index("idosos_status_idx").on(table.status),
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

export const idososMedicamentos = pgTable(
  "idosos_medicamentos",
  {
    idosoId: integer("idoso_id")
      .notNull()
      .references(() => idosos.id, { onDelete: "cascade" }),
    medicamentoId: integer("medicamento_id")
      .notNull()
      .references(() => medicamentos.id, { onDelete: "restrict" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.idosoId, table.medicamentoId] }),
    idosoIdx: index("idosos_medicamentos_idoso_idx").on(table.idosoId),
    medicamentoIdx: index("idosos_medicamentos_medicamento_idx").on(table.medicamentoId),
  })
);

export const idososRelations = relations(idosos, ({ many }) => ({
  medicamentosRelacionados: many(idososMedicamentos),
}));

export const medicamentosRelations = relations(medicamentos, ({ many }) => ({
  idososRelacionados: many(idososMedicamentos),
}));

export const idososMedicamentosRelations = relations(idososMedicamentos, ({ one }) => ({
  idoso: one(idosos, {
    fields: [idososMedicamentos.idosoId],
    references: [idosos.id],
  }),
  medicamento: one(medicamentos, {
    fields: [idososMedicamentos.medicamentoId],
    references: [medicamentos.id],
  }),
}));

export type Idoso = typeof idosos.$inferSelect;
export type NovoIdoso = typeof idosos.$inferInsert;

export type Medicamento = typeof medicamentos.$inferSelect;
export type NovoMedicamento = typeof medicamentos.$inferInsert;