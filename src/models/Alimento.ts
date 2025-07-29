
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Prato } from './Prato';

@Entity({ name: 'alimento' })
export class Alimento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    nome: string;

    @Column({ type: 'float' })
    custo: number;

    @Column({ type: 'float', nullable: true })
    peso: number;

    @ManyToMany(() => Prato, prato => prato.alimentos)
    pratos: Prato[];

    @Column({ type: 'boolean', default: true })
    ativo: boolean;
}
