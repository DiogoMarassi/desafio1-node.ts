/**
 * @swagger
 * tags:
 *   - name: Pratos
 *     description: Endpoints relacionados a Pratos
 */

import { Request, Response } from 'express';
import { PratoService } from '../services/PratoService';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { AutorizacaoService } from '../services/AutorizacaoService';
import { AppDataSource } from '../database/data-source';
import { Prato } from '../models/Prato';
import { Alimento } from '../models/Alimento';
import { Autorizacao } from '../models/Autorizacao';
import { Usuario } from '../models/Usuario';


const autorizacaoService = new AutorizacaoService(
  AppDataSource.getRepository(Autorizacao),
  AppDataSource.getRepository(Usuario)
);

const pratoService = new PratoService(
  AppDataSource.getRepository(Prato),
  AppDataSource.getRepository(Alimento),
  autorizacaoService,
  AppDataSource.getRepository(Autorizacao),
);

export class PratoController {
  /**
   * @swagger
   * /api/pratos:
   *   get:
   *     tags: ["Pratos"]
   *     summary: Retorna todos os pratos ativos
   *     security:
   *     - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de pratos retornada com sucesso.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                   nome:
   *                     type: string
   *                   preco:
   *                     type: string
   *                   data_lancamento:
   *                     type: string
   *                     format: date
   *                   custo:
   *                     type: number
   *                   ativo:
   *                     type: boolean
   *                   alimentos:
   *                     type: array
   *                     items:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                         nome:
   *                           type: string
   *                         custo:
   *                           type: number
   *                         peso:
   *                           type: number
   */
  async getAll(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const autorizado = await autorizacaoService.usuarioEhAdmin(user.id);
    if (!autorizado) {
      return res.status(403).json({ message: 'Esta ação necessita de permissão de administrador!' });
    }
    const pratos = await pratoService.findAll();
    res.json(pratos);
  }

  /**
   * @swagger
   * /api/pratos/{id}:
   *   get:
   *     tags: ["Pratos"]
   *     summary: Retorna um prato pelo ID
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Prato encontrado com sucesso.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 nome:
   *                   type: string
   *                 preco:
   *                   type: string
   *                 data_lancamento:
   *                   type: string
   *                   format: date
   *                 custo:
   *                   type: number
   *                 ativo:
   *                   type: boolean
   *                 alimentos:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       nome:
   *                         type: string
   *                       custo:
   *                         type: number
   *                       peso:
   *                         type: number
   *       404:
   *         description: Prato não encontrado.
   */
  async getById(req: Request, res: Response) {
    const usuario = (req as any).user;

    if (!usuario || !usuario.id || !usuario.cargo) {
      return res.status(401).json({ message: 'Usuário não autenticado ou dados incompletos no token' });
    }

    const prato = await pratoService.findById(+req.params.id, usuario);
    if (!prato) return res.status(404).json({ message: 'Prato não encontrado ou acesso negado' });

    res.json(prato);
  }
  /**
   * @swagger
   * /api/pratos:
   *   post:
   *     tags: ["Pratos"]
   *     summary: Cria um novo prato
   *     security:
   *     - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nome
   *               - preco
   *               - data_lancamento
   *               - custo
   *             properties:
   *               nome:
   *                 type: string
   *                 example: Feijoada
   *               preco:
   *                 type: string
   *                 example: "25.00"
   *               data_lancamento:
   *                 type: string
   *                 format: date
   *                 example: "2025-08-01"
   *               custo:
   *                 type: number
   *                 example: 15.0
   *               alimentos:
   *                 type: array
   *                 items:
   *                   type: number
   *                   example: 1
   *     responses:
   *       201:
   *         description: Prato criado com sucesso.
   */
  async create(req: Request, res: Response) {
    try {
      const { user } = req as AuthenticatedRequest;

      // Verifica se é admin
      const autorizado = await autorizacaoService.usuarioEhAdmin(user.id);
      if (!autorizado) {
        return res
          .status(403)
          .json({ message: 'Esta ação necessita de permissão de administrador!' });
      }

      // Busca o usuário completo no banco
      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepo.findOne({ where: { id: user.id } });

      if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Cria o prato já com a autorização do usuário
      const novoPrato = await pratoService.create(req.body, usuario);

      return res.status(201).json(novoPrato);
    } catch (error: any) {
      console.error('Erro ao criar prato:', error);
      return res.status(500).json({ message: 'Erro ao criar prato', error: error.message });
    }
  }
  /**
   * @swagger
   * /api/pratos/{id}:
   *   put:
   *     tags: ["Pratos"]
   *     summary: Atualiza um prato existente
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nome:
   *                 type: string
   *               preco:
   *                 type: string
   *               data_lancamento:
   *                 type: string
   *                 format: date
   *               custo:
   *                 type: number
   *               alimentos:
   *                 type: array
   *                 items:
   *                   type: number
   *     responses:
   *       200:
   *         description: Prato atualizado com sucesso.
   *       404:
   *         description: Prato não encontrado.
   */
  async update(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const autorizado = await autorizacaoService.usuarioEhEditor(user.id);
    if (!autorizado) {
      return res.status(403).json({ message: 'Esta ação necessita de permissão de editor ou administrador!' });
    }
    const atualizado = await pratoService.update(+req.params.id, user, req.body);
    if (!atualizado) return res.status(404).json({ message: 'Prato não encontrado' });
    res.json(atualizado);
  }

  /**
   * @swagger
   * /api/pratos/{id}:
   *   delete:
   *     tags: ["Pratos"]
   *     summary: Realiza exclusão lógica de um prato
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Prato excluído com sucesso.
   *       404:
   *         description: Prato não encontrado.
   */
  async softDelete(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const autorizado = await autorizacaoService.usuarioEhAdmin(user.id);
    if (!autorizado) {
      return res.status(403).json({ message: 'Esta ação necessita de permissão de administrador!' });
    }
    const ok = await pratoService.softDelete(+req.params.id, user);
    if (!ok) return res.status(404).json({ message: 'Prato não encontrado' });
    res.status(204).send();
  }
}
