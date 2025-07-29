import { Repository } from 'typeorm';
import { Usuario, Cargo } from '../models/Usuario';
import { AppDataSource } from '../database/data-source';
import { BadRequestException } from '../exceptions/badRequestException';
import { hash } from 'bcrypt';

function isEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export class UsuarioService {
  private repository: Repository<Usuario>;

  constructor() {
    this.repository = AppDataSource.getRepository(Usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<Usuario | null> {
    return this.repository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    console.log("email dentro do findbyemail", email)
    return this.repository.findOneBy({
      email: email.trim().toLowerCase(),
    });
  }

  async create(data: Partial<Usuario>): Promise<Usuario> {
    
    if (!data.nome || typeof data.nome !== 'string') {
      throw new BadRequestException('O nome é obrigatório e deve ser uma string');
    }

    if (!data.email || typeof data.email !== 'string' || !isEmailValido(data.email)) {
      throw new BadRequestException('Email é obrigatório e deve ser válido');
    }

    if (!data.senha || typeof data.senha !== 'string' || data.senha.length < 6) {
      throw new BadRequestException('Senha é obrigatória e deve ter no mínimo 6 caracteres');
    }
    console.log("cargo");
    console.log(data.cargo);
    if (!data.cargo || !Object.values(Cargo).includes(data.cargo)) {
        throw new BadRequestException('Este cargo não existe');
    }

    const existente = await this.findByEmail(data.email);
    if (existente) {
      throw new BadRequestException('Já existe um usuário com este email');
    }

    const senhaHasheada = await hash(data.senha, 10);
    const novoUsuario = await this.repository.save({
      ...data,
      senha: senhaHasheada
    });

    return novoUsuario;
  }

  async update(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
    const usuario = await this.findById(id);
    if (!usuario) return null;

    if (data.email !== undefined) {
      if (typeof data.email !== 'string' || !isEmailValido(data.email)) {
        throw new BadRequestException('Email deve ser uma string válida');
      }

      const outro = await this.findByEmail(data.email);
      if (outro && outro.id !== id) {
        throw new BadRequestException('Já existe outro usuário com este email');
      }
    }

    if (data.senha !== undefined && (typeof data.senha !== 'string' || data.senha.length < 6)) {
      throw new BadRequestException('Senha deve ter no mínimo 6 caracteres');
    }

    delete (data as any).id;

    Object.assign(usuario, data);
    return this.repository.save(usuario);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
