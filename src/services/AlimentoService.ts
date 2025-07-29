import { Repository } from 'typeorm';
import { Alimento } from '../models/Alimento';
import { AppDataSource } from '../database/data-source';
import { BadRequestException } from '../exceptions/badRequestException';

export class AlimentoService {
  private repository: Repository<Alimento>;

  constructor() {
    this.repository = AppDataSource.getRepository(Alimento);
  }

  async findAll(): Promise<Alimento[]> {
    return this.repository.find({ where: { ativo: true } });
  }

  async findById(id: number): Promise<Alimento | null> {
    return this.repository.findOne({ where: { id, ativo: true } });
  }

  async create(data: Partial<Alimento>): Promise<Alimento> {
    if (!data.nome || typeof data.nome !== 'string') {
      throw new BadRequestException('O nome do alimento é obrigatório e deve ser uma string');
    }

    if (data.custo === undefined || typeof data.custo !== 'number' || isNaN(data.custo)) {
      throw new BadRequestException('O custo é obrigatório e deve ser um número válido');
    }

    if (data.peso !== undefined && (typeof data.peso !== 'number' || isNaN(data.peso))) {
      throw new BadRequestException('O peso, se fornecido, deve ser um número válido');
    }

    const alimento = this.repository.create({
      nome: data.nome,
      custo: data.custo,
      peso: data.peso,
      ativo: true,
    });

    return this.repository.save(alimento);
  }

  async update(id: number, data: Partial<Alimento>): Promise<Alimento | null> {
    const alimento = await this.findById(id);
    if (!alimento) return null;

    if (data.nome !== undefined && typeof data.nome !== 'string') {
      throw new BadRequestException('O nome deve ser uma string');
    }

    if (data.custo !== undefined && (typeof data.custo !== 'number' || isNaN(data.custo))) {
      throw new BadRequestException('O custo deve ser um número válido');
    }

    if (data.peso !== undefined && (typeof data.peso !== 'number' || isNaN(data.peso))) {
      throw new BadRequestException('O peso deve ser um número válido');
    }

    delete (data as any).id;
    delete (data as any).ativo;

    Object.assign(alimento, data);
    return this.repository.save(alimento);
  }

  async softDelete(id: number): Promise<Alimento> {
    const alimento = await this.findById(id);
    if (!alimento) throw new BadRequestException('O alimento informado não existe!');

    alimento.ativo = false;
    return this.repository.save(alimento);;
  }
}
