import { env } from "@api-amparo-digital/env/server";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { pacienteRoutes } from "./modules/pacientes/paciente.routes";
import { medicamentoRoutes } from "./modules/medicamentos/medicamento.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { criarAdminMasterSeNaoExistir } from "./modules/auth/admin-master.seed";
import { HttpError } from "./modules/common/http-error";
import { usuarioRoutes } from "./modules/usuarios/usuario.routes";

const baseCorsConfig = {
  origin: env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
};

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname"
      }
    }
  }
}).withTypeProvider<ZodTypeProvider>();

fastify.setErrorHandler((error, _request, reply) => {
  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  fastify.log.error(error);

  return reply.status(500).send({
    message: "Erro interno do servidor.",
  });
});

const port = env.PORT;
const host = env.HOST;

await fastify.register(fastifySwagger, {
  openapi: {
    openapi: "3.1.0",
    info: {
      title: "API Proffy",
      description: "Documentacao da API gerada com Fastify, Swagger e Scalar.",
      version: "1.0.0",
    },
  },
});

fastify.register(fastifyCors, baseCorsConfig);
fastify.register(fastifyCookie, {
  secret: env.COOKIE_SECRET
})

fastify.get(
  "/",
  {
    schema: {
      tags: ["Health"],
      summary: "Health check da API",
      description: "Retorna uma resposta simples para confirmar que o servidor esta online.",
      response: {
        200: {
          type: "string",
          examples: ["OK"],
        },
      },
    },
  },
  async () => {
    return "OK";
  },
);

await fastify.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration: {
    title: "API Proffy Docs",
  },
});

await fastify.register(authRoutes);
await fastify.register(usuarioRoutes);
await fastify.register(pacienteRoutes);
await fastify.register(medicamentoRoutes);


await criarAdminMasterSeNaoExistir();

fastify.listen({ port, host }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server running on http://${host}:${port}`);
});
