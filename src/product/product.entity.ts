import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  type: string;

  @Column('float')
  price: number;

  @Column({ nullable: true })
  variant: string;

  @Column({ nullable: true })
  picture: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('int', { default: 0 })
  quantity: number;

  @Column('bigint')
  updatedAt: number;

  @Column('jsonb', { nullable: true })
  batches: any[];

  @Column('float', { nullable: true })
  unitSellingPrice: number;
} 