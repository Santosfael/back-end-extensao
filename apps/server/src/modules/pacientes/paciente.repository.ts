import { db } from "@api-amparo-digital/db";
import {
  pacientes,
  pacientesMedicamentos,
  medicamentos,
  type NovoPaciente,
} from "@api-amparo-digital/db/schema/index";
import { and, asc, count, eq, ilike, inArray, ne, or } from "drizzle-orm";

type BuscarDuplicidadeParams = {
  cpf?: string;
  rg?: string;
  ignorarId?: number;
};

export class PacienteRepository {
  async buscarPorId(id: number) {
    const [paciente] = await db.select().from(pacientes).where(eq(pacientes.id, id)).limit(1);
    return paciente ?? null;
  }

  async buscarDetalhadoPorId(id: number) {
    const paciente = await this.buscarPorId(id);

    if (!paciente) return null;

    // Carrega os medicamentos por meio da tabela de associação paciente/medicamento.
    const medicamentosDoPaciente = await db
      .select({
        id: medicamentos.id,
        nome: medicamentos.nome,
        descricao: medicamentos.descricao,
        dosagem: medicamentos.dosagem,
      })
      .from(pacientesMedicamentos)
      .innerJoin(medicamentos, eq(pacientesMedicamentos.medicamentoId, medicamentos.id))
      .where(eq(pacientesMedicamentos.pacienteId, id))
      .orderBy(asc(medicamentos.nome));

    return {
      ...paciente,
      medicamentos: medicamentosDoPaciente,
    };
  }

  async buscarDuplicidade({ cpf, rg, ignorarId }: BuscarDuplicidadeParams) {
    const filtros = [];

    if (cpf) filtros.push(eq(pacientes.cpf, cpf));
    if (rg) filtros.push(eq(pacientes.rg, rg));

    if (filtros.length === 0) return null;

    const whereDuplicidade = filtros.length === 1 ? filtros[0] : or(...filtros);

    const whereFinal = ignorarId
      ? and(whereDuplicidade, ne(pacientes.id, ignorarId))
      : whereDuplicidade;

    const [registro] = await db.select().from(pacientes).where(whereFinal).limit(1);

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
      filtros.push(ilike(pacientes.nome, `%${params.nome}%`));
    }

    if (params.status) {
      filtros.push(eq(pacientes.status, params.status));
    } else if (!params.incluirDesligados) {
      // Por padrão, pacientes desligados ficam fora das listagens operacionais.
      filtros.push(eq(pacientes.status, "ATIVO"));
    }

    const where = filtros.length > 0 ? and(...filtros) : undefined;

    const registros = await db
      .select()
      .from(pacientes)
      .where(where)
      .orderBy(asc(pacientes.nome))
      .limit(params.limit)
      .offset(offset);

    const [totalResult] = await db.select({ total: count() }).from(pacientes).where(where);

    return {
      data: registros,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: Number(totalResult?.total ?? 0),
      },
    };
  }

  async criar(data: NovoPaciente, medicamentoIds: number[]) {
    return await db.transaction(async (tx) => {
      const [pacienteCriado] = await tx.insert(pacientes).values(data).returning();

      if (!pacienteCriado) {
        throw new Error("Erro ao criar paciente.");
      }

      if (medicamentoIds.length > 0) {
        await tx.insert(pacientesMedicamentos).values(
          medicamentoIds.map((medicamentoId) => ({
            pacienteId: pacienteCriado.id,
            medicamentoId,
          }))
        );
      }

      return pacienteCriado;
    });
  }

  async atualizar(id: number, data: Partial<NovoPaciente>, medicamentoIds?: number[]) {
    return await db.transaction(async (tx) => {
      const [pacienteAtualizado] = await tx
        .update(pacientes)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(pacientes.id, id))
        .returning();

      if (!pacienteAtualizado) {
        return null;
      }

      if (medicamentoIds) {
        // Atualizar medicamentos significa substituir completamente os vínculos anteriores.
        await tx.delete(pacientesMedicamentos).where(eq(pacientesMedicamentos.pacienteId, id));

        if (medicamentoIds.length > 0) {
          await tx.insert(pacientesMedicamentos).values(
            medicamentoIds.map((medicamentoId) => ({
              pacienteId: id,
              medicamentoId,
            }))
          );
        }
      }

      return pacienteAtualizado;
    });
  }

  async alterarStatus(id: number, status: "ATIVO" | "DESLIGADO") {
    const [pacienteAtualizado] = await db
      .update(pacientes)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(pacientes.id, id))
      .returning();

    return pacienteAtualizado ?? null;
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
