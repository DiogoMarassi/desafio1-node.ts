import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Prato } from '../models/Prato';
import { Alimento } from '../models/Alimento';
import { Usuario } from '../models/Usuario';
import { Autorizacao } from '../models/Autorizacao';
import * as dotenv from 'dotenv';
dotenv.config();

const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: DATABASE_HOST,
  port: 3306,
  username: DATABASE_USER,          
  password: DATABASE_PASSWORD,      
  database: DATABASE_NAME,  
  synchronize: true,          
  logging: false,
  entities: [Prato, Alimento, Usuario, Autorizacao],
});
