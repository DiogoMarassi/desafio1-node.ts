import 'reflect-metadata';
import express from 'express';
import mysql from 'mysql2/promise';
import { AppDataSource } from './database/data-source';
import * as dotenv from 'dotenv';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Request, Response, NextFunction } from 'express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Desafio GoLiveTech',
      version: '1.0.0',
      description: 'Documentação da API de pratos, alimentos e usuários',
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
  apis: ['./src/controllers/*.ts'], // ajuste conforme sua estrutura
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

async function verificaBanco() {
  const connection = await mysql.createConnection({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DATABASE_NAME}\``);
  await connection.end();
}

async function inicializa() {
  await verificaBanco();

  await AppDataSource.initialize();
  console.log('Banco conectado e tabelas sincronizadas.');

  const app = express();
  app.use(express.json());

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
