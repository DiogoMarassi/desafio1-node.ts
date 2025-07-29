import { AppDataSource } from '../database/data-source';
import { Autorizacao } from '../models/Autorizacao';
import { Repository } from 'typeorm';

export class AutorizacaoService {
  private repository: Repository<Autorizacao>;

  constructor() {
    this.repository = AppDataSource.getRepository(Autorizacao);
  }

  async usuarioTemAcessoAoPrato(usuarioId: number, pratoId: number): Promise<boolean> {
    const autorizacao = await this.repository.findOne({
      where: { usuario: { id: usuarioId }, prato: { id: pratoId } },
    });

    return !!autorizacao;
  }
}
