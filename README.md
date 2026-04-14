# api-amparo-digital

API em TypeScript criada a partir do Better-T-Stack e organizada como um monorepo `npm workspaces`. A base do template já trouxe a separação entre aplicação, pacotes compartilhados, validação de ambiente e camada de banco, o que deixa o projeto pronto para crescer sem misturar responsabilidades.

## Como essa aplicação funciona

Hoje a aplicação expõe um servidor Fastify em `apps/server`, com um endpoint inicial `GET /` que retorna `OK`. Na inicialização, o servidor:

1. carrega as variáveis de ambiente validadas pelo pacote `@api-amparo-digital/env`
2. sobe uma instância do Fastify com logger habilitado
3. registra o plugin de CORS usando o valor de `CORS_ORIGIN`
4. começa a escutar na porta `3000`

O banco fica em `packages/db`. Esse pacote concentra:

- a criação da conexão Drizzle com PostgreSQL
- o schema do banco
- os comandos de migração, geração e studio via `drizzle-kit`
- o `docker-compose.yml` para subir o PostgreSQL localmente

As variáveis de ambiente ficam em `packages/env`, usando `@t3-oss/env-core` com `zod`. Isso garante que `DATABASE_URL`, `CORS_ORIGIN` e `NODE_ENV` sejam validados antes da aplicação rodar.

## Estrutura do monorepo

```text
api-amparo-digital/
├── apps/
│   └── server/           # API Fastify
├── packages/
│   ├── config/           # Configurações compartilhadas do workspace
│   ├── db/               # Drizzle, schema e comandos do PostgreSQL
│   └── env/              # Validação tipada das variáveis de ambiente
├── package.json          # Scripts do workspace
└── package-lock.json     # Resolução exata das dependências
```

## Fluxo de execução

### 1. Instalação

```bash
npm install
```

O workspace está configurado com versões exatas de dependência e com `save-exact=true` para evitar upgrades acidentais por faixa semver.

### 2. Ambiente

Preencha `apps/server/.env` com pelo menos:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### 3. Banco local

Para subir o PostgreSQL local:

```bash
npm run db:start
```

Para aplicar o schema:

```bash
npm run db:push
```

### 4. Desenvolvimento

Para rodar o servidor:

```bash
npm run dev:server
```

O servidor ficará disponível em `http://localhost:3000`.

## Scripts principais

- `npm run dev`: executa os apps do workspace em modo de desenvolvimento
- `npm run dev:server`: sobe apenas o servidor Fastify
- `npm run build`: gera build dos workspaces
- `npm run check-types`: valida os tipos TypeScript em todos os workspaces
- `npm run check`: roda o Biome para lint e formatação
- `npm run db:start`: sobe o banco com Docker Compose
- `npm run db:stop`: pausa o banco
- `npm run db:down`: remove os containers do banco
- `npm run db:push`: aplica o schema atual no banco
- `npm run db:generate`: gera artefatos do Drizzle
- `npm run db:migrate`: executa migrations
- `npm run db:studio`: abre o Drizzle Studio

## Como instalar novos pacotes em cada workspace

Este monorepo usa `npm workspaces`, então o ideal é instalar cada pacote no workspace correto usando `--workspace`. Como o projeto está com `save-exact=true`, os comandos abaixo já salvam a versão fixa no `package.json`.

### Instalar no workspace raiz

Use isso quando a dependência for compartilhada pelo monorepo inteiro ou necessária no `package.json` da raiz:

```bash
npm install --save-exact nome-do-pacote
```

Para dependência de desenvolvimento na raiz:

```bash
npm install --save-dev --save-exact nome-do-pacote
```

### Instalar no `apps/server`

Use isso para bibliotecas da API Fastify:

```bash
npm install --workspace server --save-exact nome-do-pacote
```

Para dependência de desenvolvimento do servidor:

```bash
npm install --workspace server --save-dev --save-exact nome-do-pacote
```

Exemplos:

```bash
npm install --workspace server --save-exact @fastify/swagger
npm install --workspace server --save-dev --save-exact pino-pretty
```

### Instalar no `packages/db`

Use isso para dependências ligadas ao Drizzle, PostgreSQL e tooling do banco:

```bash
npm install --workspace @api-amparo-digital/db --save-exact nome-do-pacote
```

Para dependência de desenvolvimento:

```bash
npm install --workspace @api-amparo-digital/db --save-dev --save-exact nome-do-pacote
```

### Instalar no `packages/env`

Use isso para bibliotecas relacionadas a variáveis de ambiente e validação:

```bash
npm install --workspace @api-amparo-digital/env --save-exact nome-do-pacote
```

Para dependência de desenvolvimento:

```bash
npm install --workspace @api-amparo-digital/env --save-dev --save-exact nome-do-pacote
```

### Dica prática

Depois de instalar novos pacotes, normalmente vale rodar:

```bash
npm run check-types --workspace server
```

Ou o script do workspace que você alterou, para confirmar que a instalação não quebrou os tipos ou o build.

## Sobre o Better-T-Stack aqui

O Better-T-Stack serviu como base para acelerar a criação do projeto, mas o comportamento real da aplicação depende do que está implementado no monorepo. Neste repositório, isso significa:

- Fastify como servidor HTTP
- Drizzle ORM para acesso ao PostgreSQL
- `zod` para tipagem e validação
- `@t3-oss/env-core` para validar ambiente
- Biome para padronização de código

Em outras palavras, o template deu a estrutura; a regra de negócio e os endpoints ainda serão evoluídos em cima dessa base.
