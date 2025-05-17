import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopId: string;

  @Column()
  productId: string;

  @Column('bigint')
  date: number;

  @Column('float')
  unitPrice: number;

  @Column('int')
  quantity: number;

  @Column()
  status: string;
} 