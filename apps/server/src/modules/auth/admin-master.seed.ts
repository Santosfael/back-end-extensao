import { env } from "@api-amparo-digital/env/server";
import bcrypt from "bcryptjs";
import { AuthRepository } from "./auth.repository";

export async function criarAdminMasterSeNaoExistir() {
  const repository = new AuthRepository();

  // O ADMIN_MASTER inicial é criado apenas quando ainda não existe outro perfil mestre.
  const existeAdminMaster = await repository.existeAdminMaster();

  if (existeAdminMaster) {
    return;
  }

  const senhaHash = await bcrypt.hash(env.ADMIN_MASTER_PASSWORD, 10);

  await repository.criarUsuario({
    nome: env.ADMIN_MASTER_NAME,
    email: env.ADMIN_MASTER_EMAIL,
    senhaHash,
    perfil: "ADMIN_MASTER",
    ativo: true,
  });
}
