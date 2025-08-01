import 'reflect-metadata';
import express from 'express';
import mysql from 'mysql2/promise';
import { AppDataSource } from './database/data-source';
import * as dotenv from 'dotenv';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Request, Response, NextFunction } from 'express';
import { hash } from 'bcrypt';
import { Cargo } from './models/Usuario'; 
import cors from 'cors';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Documentação Back-end - Desafio Node',
      version: '1.0.0',
      description: `

## Autenticação

A autenticação é feita via **JWT**.

- Para obter o token, utilize a rota: \`POST /api/usuarios/login\` na aba "Usuarios".
- O token deve ser incluído no header de cada requisição protegida. Deve ser inserida no swagger no canto superior direito.
---

## Perfis de Acesso

A plataforma possui três tipos de usuários, cada um com as devidas permissões solicitadas:

- **LEITOR**: pode visualizar dados especificados pelo admin.
- **EDITOR**: pode criar e editar dados especificados pelo admin.
- **ADMIN**: tem acesso total, incluindo ações administrativas.

Observe que, como não posso dar permissão de criação de usuário para usuários normais, ao iniciar a aplicação, um superuser já é criado com as seguintes credenciais:

- **email**: dmaraassi@gmail.com
- **senha**: 123456
---

## Organização da API e decisões tomadas

- O projeto foi organizado na arquitetura MVC, cada um com sua respectiva entidade de responsabilidade.
- A verificação da autenticação externa (via token) fica sob responsabilidade dos Controllers e as regras do negócio (autenticação interna/por cargo) sob responsabilidade dos Services.
- Mesmo sem testes, os repositórios/serviços internos utilizados foram injetados nos controllers como boa prática.
---

## Ambiente

As credencias do banco podem ser ajustadas no .env, a partir das variáveis abaixo:
- DATABASE_NAME = banco_desafio_golivetech
- DATABASE_HOST = localhost
- DATABASE_USER = root
- DATABASE_PASSWORD = 123456
- PORT = 3000

Também é necessário o secret do JWT também no .env

- JWT_SECRET=md@aij4!n43o5@i43n%5!ok34n%n53n%5@
---

## Testes e Swagger UI

Para testar o back-end, usamos o Swagger diretamente no navegador.
Se estiver rodando localmente, acesse: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---
      `,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts'], // Ajuste para o caminho onde estão seus controllers
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);

dotenv.config();

const PORT = process.env.PORT || 3000;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

console.log('DB config:', {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

export async function verificaBancoComSuperuser() {
  // Etapa 1: Cria o banco se não existir
  const connection = await mysql.createConnection({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DATABASE_NAME}\``);
  await connection.end();

  // Etapa 2: Conecta ao banco recém-criado
  const db = await mysql.createConnection({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
  });

  // Etapa 3: Verifica se o superusuário já existe
  const [rows]: any[] = await db.query(
    'SELECT id FROM usuario WHERE email = ? LIMIT 1',
    ['dmaraassi@gmail.com']
  );

  let superUserId: number;

  if (rows.length === 0) {
    const senhaCriptografada = await hash('123456', 10);

    const [result]: any = await db.query(
      `INSERT INTO usuario (nome, email, senha, cargo) VALUES (?, ?, ?, ?)`,
      ['Superusuário', 'dmaraassi@gmail.com', senhaCriptografada, Cargo.ADMIN]
    );

    superUserId = result.insertId;
    console.log('✅ Superusuário criado com sucesso!');
  } else {
    superUserId = rows[0].id;
    console.log('ℹ Superusuário já existe, nada foi feito.');
  }

  // Etapa 4: Associa o superusuário a todos os pratos
  const [pratos]: any[] = await db.query('SELECT id FROM prato WHERE ativo = 1');
  if (pratos.length > 0) {
    for (const prato of pratos) {
      // Verifica se já existe autorização para evitar duplicadas
      const [existe]: any[] = await db.query(
        'SELECT id FROM autorizacao WHERE usuarioId = ? AND pratoId = ? LIMIT 1',
        [superUserId, prato.id]
      );

      if (existe.length === 0) {
        await db.query(
          'INSERT INTO autorizacao (usuarioId, pratoId) VALUES (?, ?)',
          [superUserId, prato.id]
        );
      }
    }
    console.log(`🔗 Superusuário associado a ${pratos.length} pratos.`);
  } else {
    console.log('ℹ Nenhum prato encontrado para associar ao superusuário.');
  }

  await db.end();
}



async function inicializa() {
  await verificaBancoComSuperuser();

  await AppDataSource.initialize();
  console.log('Banco conectado e tabelas sincronizadas.');

  const app = express();
  app.use(express.json());

  app.use(cors({
    origin: 'http://localhost:3000', // URL do seu Next.js
    methods: ['GET','POST','PUT','DELETE'],
    allowedHeaders: ['Content-Type','Authorization']
  }));
  
  app.use('/api', routes);
  // Documentação do back-end em swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Middleware para erros
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.statusCode || 500;
    const message = err.message || 'Erro interno no servidor';
    res.status(status).json({ error: message });
  });

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Swagger rodando em localhost:${PORT}/api-docs`);
  });
}

inicializa().catch((err) => {
  console.error('Erro na inicialização:', err);
});
