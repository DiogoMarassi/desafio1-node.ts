import { Autorizacao } from '../models/Autorizacao';
import { Repository, In } from 'typeorm';
import { Usuario, Cargo } from '../models/Usuario';

export class AutorizacaoService {
  constructor(
    private repository: Repository<Autorizacao>,
    private repositoryUsuario: Repository<Usuario>) { }

  async usuarioTemAcessoAoPrato(usuarioId: number, pratoId: number): Promise<boolean> {
    const autorizacao = await this.repository.findOne({
      where: { usuario: { id: usuarioId }, prato: { id: pratoId } },
    });

    return !!autorizacao;
  }
  async usuarioEhAdmin(usuarioId: number): Promise<boolean> {
    const usuario = await this.repositoryUsuario.findOne({
      where: { id: usuarioId, cargo: Cargo.ADMIN },
    });
    return !!usuario;
  }
  async usuarioEhEditor(usuarioId: number): Promise<boolean> {
    const usuario = await this.repositoryUsuario.findOne({
      where: {
        id: usuarioId,
        cargo: In([Cargo.EDITOR, Cargo.ADMIN])
      }
    });
    return !!usuario;
  }
}
