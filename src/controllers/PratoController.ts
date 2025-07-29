/**
 * @swagger
 * tags:
 *   - name: Pratos
 *     description: Endpoints relacionados a Pratos
 */

import { Request, Response } from 'express';
import { PratoService } from '../services/PratoService';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

const service = new PratoService();

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
    const pratos = await service.findAll();
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

  const prato = await service.findById(+req.params.id, usuario);
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
    const novoPrato = await service.create(req.body);
    res.status(201).json(novoPrato);
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
    const user = (req as AuthenticatedRequest).user;
    const atualizado = await service.update(+req.params.id, user, req.body);
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
    const user = (req as AuthenticatedRequest).user;
    const ok = await service.softDelete(+req.params.id, user);
    if (!ok) return res.status(404).json({ message: 'Prato não encontrado' });
    res.status(204).send();
  }
}
