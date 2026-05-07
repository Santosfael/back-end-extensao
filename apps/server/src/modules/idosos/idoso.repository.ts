import { db } from "@api-amparo-digital/db";
import {
  idosos,
  idososMedicamentos,
  medicamentos,
  type NovoIdoso,
} from "@api-amparo-digital/db/schema/index";
import { and, asc, count, eq, ilike, inArray, ne } from "drizzle-orm";

type BuscarDuplicidadeParams = {
  cpf?: string;
  rg?: string;
  ignorarId?: number;
};

export class IdosoRepository {
  async buscarPorId(id: number) {
    const [idoso] = await db.select().from(idosos).where(eq(idosos.id, id)).limit(1);
    return idoso ?? null;
  }

  async buscarDetalhadoPorId(id: number) {
    const idoso = await this.buscarPorId(id);

    if (!idoso) return null;

    const medicamentosDoIdoso = await db
      .select({
        id: medicamentos.id,
        nome: medicamentos.nome,
        descricao: medicamentos.descricao,
        dosagem: medicamentos.dosagem,
      })
      .from(idososMedicamentos)
      .innerJoin(medicamentos, eq(idososMedicamentos.medicamentoId, medicamentos.id))
      .where(eq(idososMedicamentos.idosoId, id))
      .orderBy(asc(medicamentos.nome));

    return {
      ...idoso,
      medicamentos: medicamentosDoIdoso,
    };
  }

  async buscarDuplicidade({ cpf, rg, ignorarId }: BuscarDuplicidadeParams) {
    const filtros = [];

    if (cpf) filtros.push(eq(idosos.cpf, cpf));
    if (rg) filtros.push(eq(idosos.rg, rg));

    if (filtros.length === 0) return null;

    const whereDuplicidade =
      filtros.length === 1 ? filtros[0] : filtros.reduce((acc, filtro) => acc ?? filtro);

    const whereFinal = ignorarId
      ? and(whereDuplicidade, ne(idosos.id, ignorarId))
      : whereDuplicidade;

    const [registro] = await db.select().from(idosos).where(whereFinal).limit(1);

    return registro ?? null;
  }

  async listar(params: {
    page: number;
    limit: number;
    nome?: string;
    status?: "ATIVO" | "DESLIGADO";
    incluirDesligados?: boolean;
  }) {
    const offset = (params.page - 1) * params.limit;
    const filtros = [];

    if (params.nome) {
      filtros.push(ilike(idosos.nome, `%${params.nome}%`));
    }

    if (params.status) {
      filtros.push(eq(idosos.status, params.status));
    } else if (!params.incluirDesligados) {
      filtros.push(eq(idosos.status, "ATIVO"));
    }

    const where = filtros.length > 0 ? and(...filtros) : undefined;

    const registros = await db
      .select()
      .from(idosos)
      .where(where)
      .orderBy(asc(idosos.nome))
      .limit(params.limit)
      .offset(offset);

    const [totalResult] = await db.select({ total: count() }).from(idosos).where(where);

    return {
      data: registros,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: Number(totalResult?.total ?? 0),
      },
    };
  }

  async criar(data: NovoIdoso, medicamentoIds: number[]) {
    return await db.transaction(async (tx) => {
      const [idosoCriado] = await tx.insert(idosos).values(data).returning();

      if (!idosoCriado) {
        throw new Error("Erro ao criar idoso.");
      }

      if (medicamentoIds.length > 0) {
        await tx.insert(idososMedicamentos).values(
          medicamentoIds.map((medicamentoId) => ({
            idosoId: idosoCriado.id,
            medicamentoId,
          }))
        );
      }

      return idosoCriado;
    });
  }

  async atualizar(id: number, data: Partial<NovoIdoso>, medicamentoIds?: number[]) {
    return await db.transaction(async (tx) => {
      const [idosoAtualizado] = await tx
        .update(idosos)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(idosos.id, id))
        .returning();

      if (!idosoAtualizado) {
        return null;
      }

      if (medicamentoIds) {
        await tx.delete(idososMedicamentos).where(eq(idososMedicamentos.idosoId, id));

        if (medicamentoIds.length > 0) {
          await tx.insert(idososMedicamentos).values(
            medicamentoIds.map((medicamentoId) => ({
              idosoId: id,
              medicamentoId,
            }))
          );
        }
      }

      return idosoAtualizado;
    });
  }

  async alterarStatus(id: number, status: "ATIVO" | "DESLIGADO") {
    const [idosoAtualizado] = await db
      .update(idosos)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(idosos.id, id))
      .returning();

    return idosoAtualizado ?? null;
  }

  async validarMedicamentosExistem(ids: number[]) {
    if (ids.length === 0) return true;

    const encontrados = await db
      .select({ id: medicamentos.id })
      .from(medicamentos)
      .where(inArray(medicamentos.id, ids));

    return encontrados.length === ids.length;
  }
}