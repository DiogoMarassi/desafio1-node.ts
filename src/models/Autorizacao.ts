import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Usuario } from './Usuario';
import { Prato } from './Prato';

@Entity({ name: 'autorizacao' })
export class Autorizacao {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { nullable: false })
  usuario: Usuario;

  @ManyToOne(() => Prato, { nullable: false })
  prato: Prato;
}
