import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Alimento } from './Alimento';

@Entity({ name: 'prato' })
export class Prato {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ type: 'varchar', length: 255 })
    nome: string;

    @Column({ type: 'varchar', length: 255 })
    preco: string; // cuidado: se for número, prefira `float`

    @Column({ type: 'datetime' })
    data_lancamento: Date;

    @Column({ type: 'float' })
    custo: number;

    @Column({ type: 'boolean', default: true })
    ativo: boolean;

    @ManyToMany(() => Alimento, alimento => alimento.pratos, { cascade: true })
    // Tabela intermediária para a relação N:N. Como ela não possui atributos, não fiz nenhum modelo adicional. Usei apenas o joinTable mesmo.
    @JoinTable({
    name: 'prato_alimento', 
    joinColumn: { name: 'prato_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'alimento_id', referencedColumnName: 'id' },
    })
    alimentos: Alimento[];
}

