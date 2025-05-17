import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopId: string;

  @Column()
  productId: string;

  @Column('bigint')
  date: number;

  @Column('int')
  quantity: number;

  @Column('jsonb')
  costs: Record<string, number>;

  @Column('float')
  totalCost: number;

  @Column('float')
  unitPrice: number;
} 