/**
 * @swagger
 * tags:
 *   - name: Alimentos
 *     description: Endpoints relacionados a Alimentos
 */

import { Request, Response } from 'express';
import { AlimentoService } from '../services/AlimentoService';

const service = new AlimentoService();

export class AlimentoController {
  /**
   * @swagger
   * /api/alimentos:
   *   get:
   *     tags: ["Alimentos"]
   *     summary: Retorna todos os alimentos ativos
   *     security:
   *     - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de alimentos retornada com sucesso.
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
   *                   custo:
   *                     type: number
   *                   peso:
   *                     type: number
   *                   ativo:
   *                     type: boolean
   */
  async getAll(req: Request, res: Response) {
    const alimentos = await service.findAll();
    res.json(alimentos);
  }

  /**
   * @swagger
   * /api/alimentos/{id}:
   *   get:
   *     tags: ["Alimentos"]
   *     summary: Retorna um alimento pelo ID
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
   *         description: Alimento encontrado com sucesso.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 nome:
   *                   type: string
   *                 custo:
   *                   type: number
   *                 peso:
   *                   type: number
   *                 ativo:
   *                   type: boolean
   *       404:
   *         description: Alimento não encontrado.
   */
  async getById(req: Request, res: Response) {
    const alimento = await service.findById(+req.params.id);
    if (!alimento) return res.status(404).json({ message: 'Alimento não encontrado' });
    res.json(alimento);
  }

  /**
   * @swagger
   * /api/alimentos:
   *   post:
   *     tags: ["Alimentos"]
   *     summary: Cria um novo alimento
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
   *               - custo
   *             properties:
   *               nome:
   *                 type: string
   *                 example: Arroz
   *               custo:
   *                 type: number
   *                 example: 3.50
   *               peso:
   *                 type: number
   *                 example: 0.5
   *     responses:
   *       201:
   *         description: Alimento criado com sucesso.
   */
  async create(req: Request, res: Response) {
    const novo = await service.create(req.body);
    res.status(201).json(novo);
  }

  /**
   * @swagger
   * /api/alimentos/{id}:
   *   put:
   *     tags: ["Alimentos"]
   *     summary: Atualiza um alimento existente
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
   *               custo:
   *                 type: number
   *               peso:
   *                 type: number
   *     responses:
   *       200:
   *         description: Alimento atualizado com sucesso.
   *       404:
   *         description: Alimento não encontrado.
   */
  async update(req: Request, res: Response) {
    const atualizado = await service.update(+req.params.id, req.body);
    if (!atualizado) return res.status(404).json({ message: 'Alimento não encontrado' });
    res.json(atualizado);
  }

  /**
   * @swagger
   * /api/alimentos/{id}:
   *   delete:
   *     tags: ["Alimentos"]
   *     summary: Realiza exclusão lógica de um alimento
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
   *         description: Alimento excluído com sucesso.
   *       404:
   *         description: Alimento não encontrado.
   */
  async softDelete(req: Request, res: Response) {
    const ok = await service.softDelete(+req.params.id);
    if (!ok) return res.status(404).json({ message: 'Alimento não encontrado' });
    res.status(204).send();
  }
}
