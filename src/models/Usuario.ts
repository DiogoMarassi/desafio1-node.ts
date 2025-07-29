import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum Cargo {
  LEITOR = 'LEITOR',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN'
}

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 255 })
  senha: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'enum', enum: Cargo })
  cargo: Cargo;
}
