import { db } from "@api-amparo-digital/db";
import { medicamentos, type NovoMedicamento } from "@api-amparo-digital/db/schema/index";
import { asc, ilike } from "drizzle-orm";

export class MedicamentoRepository {
  async criar(data: NovoMedicamento) {
    const [medicamento] = await db.insert(medicamentos).values(data).returning();
    return medicamento;
  }

  async listar(params: { nome?: string }) {
    return await db
      .select()
      .from(medicamentos)
      .where(params.nome ? ilike(medicamentos.nome, `%${params.nome}%`) : undefined)
      .orderBy(asc(medicamentos.nome));
  }
}