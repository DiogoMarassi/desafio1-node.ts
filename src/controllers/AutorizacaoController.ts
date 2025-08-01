/**
 * @swagger
 * tags:
 *   - name: Autorizacoes
 *     description: Endpoints relacionados às autorizações de usuários aos pratos
 */

import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Autorizacao } from '../models/Autorizacao';
import { Usuario } from '../models/Usuario';
import { AutorizacaoService } from '../services/AutorizacaoService';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

const autorizacaoService = new AutorizacaoService(
  AppDataSource.getRepository(Autorizacao),
  AppDataSource.getRepository(Usuario)
);

const autorizacaoRepository = AppDataSource.getRepository(Autorizacao);

const usuarioRepository = AppDataSource.getRepository(Usuario);

export class AutorizacaoController {

  /**
   * @swagger
   * /api/autorizacoes:
   *   get:
   *     tags: ["Autorizacoes"]
   *     summary: Lista todas as autorizações
   *     security:
   *     - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de autorizações
   */
  async getAll(req: Request, res: Response) {
    const autorz = await autorizacaoRepository.find({ relations: ['usuario', 'prato'] });
    res.json(autorz);
  }

  /**
   * @swagger
   * /api/autorizacoes/{id}:
   *   get:
   *     tags: ["Autorizacoes"]
   *     summary: Retorna uma autorização pelo ID
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
   *         description: Autorização encontrada.
   *       404:
   *         description: Autorização não encontrada.
   */
  async getById(req: Request, res: Response) {
    const id = +req.params.id;
    const autorizacao = await autorizacaoRepository.findOne({ where: { id }, relations: ['usuario', 'prato'] });
    if (!autorizacao) return res.status(404).json({ message: 'Autorização não encontrada' });
    res.json(autorizacao);
  }

  /**
   * @swagger
   * /api/autorizacoes/usuario/{id}:
   *   get:
   *     tags: ["Autorizacoes"]
   *     summary: Lista os pratos autorizados para um usuário
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
   *         description: Lista de autorizações do usuário.
   *       404:
   *         description: Usuário não encontrado.
   */
  async getByUsuario(req: Request, res: Response) {
    const usuarioId = +req.params.id;

    const usuario = await usuarioRepository.findOneBy({ id: usuarioId });
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });

    const autorz = await autorizacaoRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['prato', 'prato.alimentos'],
    });

    res.json(autorz);
  }

  /**
   * @swagger
   * /api/autorizacoes/verifica-acesso:
   *   post:
   *     tags: ["Autorizacoes"]
   *     summary: Verifica se um usuário tem acesso a um prato
   *     security:
   *     - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - usuarioId
   *               - pratoId
   *             properties:
   *               usuarioId:
   *                 type: integer
   *               pratoId:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Resultado da verificação de acesso.
   */
  async verificarAcesso(req: Request, res: Response) {
    const { usuarioId, pratoId } = req.body;

    if (typeof usuarioId !== 'number' || typeof pratoId !== 'number') {
      return res.status(400).json({ message: 'usuarioId e pratoId devem ser números' });
    }

    const temAcesso = await autorizacaoService.usuarioTemAcessoAoPrato(usuarioId, pratoId);
    res.status(200).json({ acesso: temAcesso });
  }

  /**
   * @swagger
   * /api/autorizacoes/usuario/{id}/admin:
   *   get:
   *     tags: ["Autorizacoes"]
   *     summary: Verifica se um usuário é administrador
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
   *         description: Resultado da verificação de cargo.
   */
  async verificarAdmin(req: Request, res: Response) {
    const usuarioId = +req.params.id;
    if (isNaN(usuarioId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const ehAdmin = await autorizacaoService.usuarioEhAdmin(usuarioId);
    res.status(200).json({ admin: ehAdmin });
  }
  /**
   * @swagger
   * /api/autorizacoes/pratos-pelo-token:
   *   get:
   *     tags: ["Autorizacoes"]
   *     summary: Lista os pratos autorizados para o usuário logado
   *     description: Retorna todas as autorizações de pratos para o usuário identificado pelo token JWT.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de autorizações do usuário logado.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                   usuario:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       nome:
   *                         type: string
   *                   prato:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       nome:
   *                         type: string
   *       401:
   *         description: Token ausente ou inválido.
   */
  async getByUsuarioToken(req: Request, res: Response) {
    console.log("ENTROUUUUUUUUU!!s");
    const user = (req as AuthenticatedRequest).user;

    if (!user || !user.id) {
      return res.status(401).json({ message: 'Token inválido ou ausente' });
    }

    const usuarioId = user.id;

    // usa o repository da classe, e não uma variável solta
    const autorz = await autorizacaoRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['prato', 'prato.alimentos'], // para trazer o prato junto
    });

    return res.json(autorz);
  }



}
