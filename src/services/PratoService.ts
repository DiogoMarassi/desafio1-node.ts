import { Repository, In } from 'typeorm';
import { Prato } from '../models/Prato';
import { Alimento } from '../models/Alimento';
import { BadRequestException } from '../exceptions/BadRequestException';
import { AutorizacaoService } from './AutorizacaoService';
import { Cargo } from '../models/Usuario';
import { Usuario } from '../models/Usuario';
import { Autorizacao } from '../models/Autorizacao';

export class PratoService {
  constructor(
    private repositoryPrato: Repository<Prato>,
    private repositoryAlimento: Repository<Alimento>,
    private autorizacaoService: AutorizacaoService,
    private repositoryAutenticacao: Repository<Autorizacao>,
  ) {
  }

  async findAll(): Promise<Prato[]> {
    return this.repositoryPrato.find({
      where: { ativo: true },
      relations: ['alimentos'],
    });
  }

  async findById(id: number, usuario: { id: number; cargo: Cargo }): Promise<Prato | null> {

    const prato = await this.repositoryPrato.findOne({
      where: { id, ativo: true },
      relations: ['alimentos'],
    });

    if (!prato) return null;

    if (usuario.cargo === Cargo.ADMIN) return prato;

    const autorizado = await this.autorizacaoService.usuarioTemAcessoAoPrato(usuario.id, prato.id);
    if (!autorizado) throw new BadRequestException('Este usuário não tem acesso a este prato!');

    return prato;
  }

  async create(data: Partial<Prato>, usuario: Usuario): Promise<Prato> {

    // 1. Verifica campos obrigatórios
    if (!data.nome || !data.preco || data.custo === undefined || !data.data_lancamento) {
      throw new BadRequestException('Campos nome, preco, custo e data_lancamento são obrigatórios');
    }

    // 2. Valida tipos numéricos
    if (typeof data.preco !== 'number' || isNaN(data.preco)) {
      throw new BadRequestException('preco deve ser um número válido');
    }
    if (typeof data.custo !== 'number' || isNaN(data.custo)) {
      throw new BadRequestException('custo deve ser um número válido');
    }

    // 3. Verifica alimentos
    if (!data.alimentos || !Array.isArray(data.alimentos) || data.alimentos.length === 0) {
      throw new BadRequestException('Lista de alimentos é obrigatória');
    }

    const alimentos = await this.repositoryAlimento.find({
      where: { id: In(data.alimentos) },
    });

    if (alimentos.length !== data.alimentos.length) {
      throw new BadRequestException('Um ou mais alimentos informados não existem');
    }

    // 4. Cria o prato
    const prato = this.repositoryPrato.create({
      nome: data.nome,
      preco: data.preco,
      data_lancamento: data.data_lancamento,
      custo: data.custo,
      alimentos,
      ativo: true,
    });

    const pratoSalvo = await this.repositoryPrato.save(prato);

    // 5. Se usuário for ADMIN, cria registro na tabela Autorizacao
    if (usuario.cargo === 'ADMIN') {
      const autorizacao = this.repositoryAutenticacao.create({
        usuario,
        prato: pratoSalvo,
      });

      await this.repositoryAutenticacao.save(autorizacao);
    }

    return pratoSalvo;
  }

  async update(id: number, usuario: { id: number; cargo: Cargo }, data: Partial<Prato>): Promise<Prato | null> {
    const prato = await this.findById(id, usuario);

    if (!prato) return null;

    // Se alimentos forem passados, valida
    if (data.alimentos) {
      if (!Array.isArray(data.alimentos) || data.alimentos.length === 0) {
        throw new BadRequestException('Lista de alimentos deve ser um array não vazio');
      }

      const alimentos = await this.repositoryAlimento.find({
        where: { id: In(data.alimentos) }
      });

      if (alimentos.length !== data.alimentos.length) {
        throw new BadRequestException('Um ou mais alimentos informados não existem');
      }
      const autorizado = await this.autorizacaoService.usuarioTemAcessoAoPrato(usuario.id, prato.id);
      if (!autorizado) throw new BadRequestException('Este usuário não tem acesso a este prato!');

      data.alimentos = alimentos;
    }


    Object.assign(prato, data);
    return this.repositoryPrato.save(prato);
  }

  async softDelete(id: number, usuario: { id: number; cargo: Cargo }): Promise<Prato> {
    const prato = await this.findById(id, usuario);
    if (!prato) throw new BadRequestException('O prato informado não existe!');

    prato.ativo = false;
    return this.repositoryPrato.save(prato);
  }
}
