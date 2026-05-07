import { autenticar } from "../auth/auth.middleware";
import { autorizarPerfis } from "../auth/authorization.middleware";
import type { FastifyInstance } from "fastify";
import {
    alterarStatusUsuarioController,
    atualizarUsuarioController,
    buscarUsuarioPorIdController,
    criarUsuarioController,
    listarUsuariosController,
} from "./usuario.controller";

const somenteAdministradores = [
    autenticar,
    autorizarPerfis(["ADMIN_MASTER", "ADMIN"]),
];

export async function usuarioRoutes(app: FastifyInstance) {
    app.post(
        "/usuarios",
        {
            preHandler: somenteAdministradores,
            schema: {
                tags: ["Usuários"],
                summary: "Cadastrar usuário interno",
                body: {
                    type: "object",
                    required: ["nome", "email", "senha", "perfil"],
                    properties: {
                        nome: { type: "string" },
                        email: { type: "string" },
                        senha: { type: "string" },
                        perfil: { type: "string", enum: ["ADMIN", "ENFERMEIRO"] },
                    },
                },
            },
        },
        criarUsuarioController
    );

    app.get(
        "/usuarios",
        {
            preHandler: somenteAdministradores,
            schema: {
                tags: ["Usuários"],
                summary: "Listar usuários internos",
                querystring: {
                    type: "object",
                    properties: {
                        page: { type: "number" },
                        limit: { type: "number" },
                        nome: { type: "string" },
                        email: { type: "string" },
                        perfil: {
                            type: "string",
                            enum: ["ADMIN_MASTER", "ADMIN", "ENFERMEIRO"],
                        },
                        ativo: { type: "string", enum: ["true", "false"] },
                    },
                },
            },
        },
        listarUsuariosController
    );

    app.get(
        "/usuarios/:id",
        {
            preHandler: somenteAdministradores,
            schema: {
                tags: ["Usuários"],
                summary: "Consultar usuário interno",
                params: {
                    type: "object",
                    required: ["id"],
                    properties: {
                        id: { type: "number" },
                    },
                },
            },
        },
        buscarUsuarioPorIdController
    );

    app.put(
        "/usuarios/:id",
        {
            preHandler: somenteAdministradores,
            schema: {
                tags: ["Usuários"],
                summary: "Editar usuário interno",
                params: {
                    type: "object",
                    required: ["id"],
                    properties: {
                        id: { type: "number" },
                    },
                },
                body: {
                    type: "object",
                    properties: {
                        nome: { type: "string" },
                        email: { type: "string" },
                        senha: { type: "string" },
                        perfil: { type: "string", enum: ["ADMIN", "ENFERMEIRO"] },
                    },
                },
            },
        },
        atualizarUsuarioController
    );

    app.patch(
        "/usuarios/:id/status",
        {
            preHandler: somenteAdministradores,
            schema: {
                tags: ["Usuários"],
                summary: "Ativar ou desativar usuário interno",
                params: {
                    type: "object",
                    required: ["id"],
                    properties: {
                        id: { type: "number" },
                    },
                },
                body: {
                    type: "object",
                    required: ["ativo"],
                    properties: {
                        ativo: { type: "boolean" },
                    },
                },
            },
        },
        alterarStatusUsuarioController
    );
}