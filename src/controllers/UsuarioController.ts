/**
 * @swagger
 * tags:
 *   - name: Usuários
 *     description: Endpoints relacionados a Usuários
 */

import { Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService';
import * as jwt from 'jsonwebtoken';
import { compare } from 'bcrypt';

const service = new UsuarioService();

export class UsuarioController {
  /**
   * @swagger
   * /api/usuarios:
   *   get:
   *     tags: ["Usuários"]
   *     summary: Retorna todos os usuários cadastrados
   *     security:
   *     - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de usuários retornada com sucesso.
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
   *                   email:
   *                     type: string
   *                   cargo:
   *                     type: string
   *                   ativo:
   *                     type: boolean
   */
  async getAll(req: Request, res: Response) {
    const usuarios = await service.findAll();
    res.json(usuarios);
  }

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   get:
   *     tags: ["Usuários"]
   *     summary: Retorna um usuário pelo ID
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
   *         description: Usuário encontrado com sucesso.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 nome:
   *                   type: string
   *                 email:
   *                   type: string
   *                 cargo:
   *                   type: string
   *                 ativo:
   *                   type: boolean
   *       404:
   *         description: Usuário não encontrado.
   */
  async getById(req: Request, res: Response) {
    const usuario = await service.findById(+req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(usuario);
  }

  /**
   * @swagger
   * /api/usuarios:
   *   post:
   *     tags: ["Usuários"]
   *     summary: Cria um novo usuário
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
   *               - email
   *               - senha
   *               - cargo
   *             properties:
   *               nome:
   *                 type: string
   *                 example: João Silva
   *               email:
   *                 type: string
   *                 example: joao@email.com
   *               senha:
   *                 type: string
   *                 example: senhaSegura123
   *               cargo:
   *                 type: string
   *                 enum: [leitor, editor, administrador]
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso.
   */
  async create(req: Request, res: Response) {
    const novo = await service.create(req.body);
    res.status(201).json(novo);
  }

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   put:
   *     tags: ["Usuários"]
   *     summary: Atualiza um usuário existente
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
   *               email:
   *                 type: string
   *               senha:
   *                 type: string
   *               cargo:
   *                 type: string
   *                 enum: [leitor, editor, administrador]
   *     responses:
   *       200:
   *         description: Usuário atualizado com sucesso.
   *       404:
   *         description: Usuário não encontrado.
   */
  async update(req: Request, res: Response) {
    const atualizado = await service.update(+req.params.id, req.body);
    if (!atualizado) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(atualizado);
  }

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   delete:
   *     tags: ["Usuários"]
   *     summary: Deleta um usuário definitivamente
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
   *         description: Usuário excluído com sucesso.
   *       404:
   *         description: Usuário não encontrado.
   */
  async delete(req: Request, res: Response) {
    const ok = await service.delete(+req.params.id);
    if (!ok) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.status(204).send();
  }

  /**
   * @swagger
   * /api/usuarios/login:
   *   post:
   *     tags: ["Usuários"]
   *     summary: Realiza o login e retorna um token JWT
   *     security:
   *     - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - senha
   *             properties:
   *               email:
   *                 type: string
   *                 example: dmaraassi@gmail.com
   *               senha:
   *                 type: string
   *                 example: arte3427
   *     responses:
   *       200:
   *         description: Login realizado com sucesso. Token JWT retornado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *       400:
   *         description: Email e senha são obrigatórios.
   *       401:
   *         description: Credenciais inválidas.
   */
  async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    console.log(email);
    console.log(senha);
    const usuario = await service.findByEmail(email);
    if (!usuario) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const senhaValida = await compare(senha, usuario.senha);
    if (!senhaValida) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gera token com id, email e cargo
    const token = jwt.sign(
        {
        id: usuario.id,
        email: usuario.email,
        cargo: usuario.cargo,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' }
    );

    res.json({ token });
    }
}
