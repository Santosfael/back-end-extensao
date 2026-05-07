import { db } from "@api-amparo-digital/db";
import { usuarios, type NovoUsuario } from "@api-amparo-digital/db/schema/index";
import { eq } from "drizzle-orm";

export class AuthRepository {
  async buscarPorEmail(email: string) {
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email))
      .limit(1);

    return usuario ?? null;
  }

  async criarUsuario(data: NovoUsuario) {
    const [usuario] = await db.insert(usuarios).values(data).returning();
    return usuario;
  }

  async existeAdminMaster() {
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.perfil, "ADMIN_MASTER"))
      .limit(1);

    return Boolean(usuario);
  }
}