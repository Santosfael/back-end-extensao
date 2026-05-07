import { db } from "@api-amparo-digital/db";
import { usuarios, type NovoUsuario } from "@api-amparo-digital/db/schema/index";
import { and, asc, count, eq, ilike, ne } from "drizzle-orm";

type BuscarDuplicidadeParams = {
  email?: string;
  ignorarId?: number;
};

export class UsuarioRepository {
  async buscarPorId(id: number) {
    const [usuario] = await db
      .select({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        perfil: usuarios.perfil,
        ativo: usuarios.ativo,
        createdAt: usuarios.createdAt,
        updatedAt: usuarios.updatedAt,
      })
      .from(usuarios)
      .where(eq(usuarios.id, id))
      .limit(1);

    return usuario ?? null;
  }

  async buscarPorIdComSenha(id: number) {
    const [usuario] = await db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
    return usuario ?? null;
  }

  async buscarDuplicidade({ email, ignorarId }: BuscarDuplicidadeParams) {
    if (!email) return null;

    const where = ignorarId
      ? and(eq(usuarios.email, email), ne(usuarios.id, ignorarId))
      : eq(usuarios.email, email);

    const [usuario] = await db.select().from(usuarios).where(where).limit(1);

    return usuario ?? null;
  }

  async listar(params: {
    page: number;
    limit: number;
    nome?: string;
    email?: string;
    perfil?: "ADMIN_MASTER" | "ADMIN" | "ENFERMEIRO";
    ativo?: boolean;
  }) {
    const offset = (params.page - 1) * params.limit;
    const filtros = [];

    if (params.nome) {
      filtros.push(ilike(usuarios.nome, `%${params.nome}%`));
    }

    if (params.email) {
      filtros.push(ilike(usuarios.email, `%${params.email}%`));
    }

    if (params.perfil) {
      filtros.push(eq(usuarios.perfil, params.perfil));
    }

    if (params.ativo !== undefined) {
      filtros.push(eq(usuarios.ativo, params.ativo));
    }

    const where = filtros.length > 0 ? and(...filtros) : undefined;

    const registros = await db
      .select({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        perfil: usuarios.perfil,
        ativo: usuarios.ativo,
        createdAt: usuarios.createdAt,
        updatedAt: usuarios.updatedAt,
      })
      .from(usuarios)
      .where(where)
      .orderBy(asc(usuarios.nome))
      .limit(params.limit)
      .offset(offset);

    const [totalResult] = await db.select({ total: count() }).from(usuarios).where(where);

    return {
      data: registros,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: Number(totalResult?.total ?? 0),
      },
    };
  }

  async criar(data: NovoUsuario) {
    const [usuario] = await db
      .insert(usuarios)
      .values(data)
      .returning({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        perfil: usuarios.perfil,
        ativo: usuarios.ativo,
        createdAt: usuarios.createdAt,
        updatedAt: usuarios.updatedAt,
      });

    return usuario;
  }

  async atualizar(id: number, data: Partial<NovoUsuario>) {
    const [usuario] = await db
      .update(usuarios)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(usuarios.id, id))
      .returning({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        perfil: usuarios.perfil,
        ativo: usuarios.ativo,
        createdAt: usuarios.createdAt,
        updatedAt: usuarios.updatedAt,
      });

    return usuario ?? null;
  }

  async alterarStatus(id: number, ativo: boolean) {
    const [usuario] = await db
      .update(usuarios)
      .set({
        ativo,
        updatedAt: new Date(),
      })
      .where(eq(usuarios.id, id))
      .returning({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        perfil: usuarios.perfil,
        ativo: usuarios.ativo,
        createdAt: usuarios.createdAt,
        updatedAt: usuarios.updatedAt,
      });

    return usuario ?? null;
  }
}