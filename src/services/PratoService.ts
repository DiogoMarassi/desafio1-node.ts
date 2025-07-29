import { Repository, In } from 'typeorm';
import { Prato } from '../models/Prato';
import { AppDataSource } from '../database/data-source';
import { Alimento } from '../models/Alimento';
import { BadRequestException } from '../exceptions/badRequestException';
import { AutorizacaoService } from './AutorizacaoService';
import { Cargo } from '../models/Usuario';

// Todos os serviços utilizam diretamente o AppDataSource de desenvolvimento, 
// pois vocês não exigiram ambiente de testes ou injeção de dependência
export class PratoService {
  private repositoryPrato: Repository<Prato>;
  private repositoryAlimento: Repository<Alimento>;
  private autorizacaoService: AutorizacaoService;

  constructor() {
    this.repositoryPrato = AppDataSource.getRepository(Prato);
    this.repositoryAlimento = AppDataSource.getRepository(Alimento);
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
    if (!autorizado) return null;

    return prato;
  }

  async create(data: Partial<Prato>): Promise<Prato> {
    console.log('Criando prato com dados:', data);

    // Verificando campos obrigatórios
    if (!data.nome || !data.preco || data.custo === undefined || !data.data_lancamento) {
      throw new BadRequestException('Campos nome, preco, custo e data_lancamento são obrigatórios');
    }
    
    // Verificando tipos numéricos
    if (typeof data.preco !== 'number' || isNaN(data.preco)) {
      throw new BadRequestException('preco deve ser um número válido');
    }
    if (typeof data.custo !== 'number' || isNaN(data.custo)) {
      throw new BadRequestException('custo deve ser um número válido');
    }

    // Verifica se foi adicionado algum alimento ao prato
    if (!data.alimentos || !Array.isArray(data.alimentos) || data.alimentos.length === 0) {
      throw new BadRequestException('Lista de alimentos é obrigatória');
    }

    // Buscando no banco se existem os alimentos adiconados ao prato
    const alimentos = await this.repositoryAlimento.find({
      where: { id: In(data.alimentos) }
    });
    // Se não existir -> erro
    if (alimentos.length !== data.alimentos.length) {
      throw new BadRequestException('Um ou mais alimentos informados não existem');
    }
    
    const prato = this.repositoryPrato.create({
      nome: data.nome,
      preco: data.preco,
      data_lancamento: data.data_lancamento,
      custo: data.custo,
      alimentos,
      ativo: true,
    });

    return this.repositoryPrato.save(prato);
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
