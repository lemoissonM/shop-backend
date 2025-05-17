import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class BulkSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopId: string;

  @Column('bigint')
  date: number;

  @Column('jsonb')
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];

  @Column('float')
  subtotal: number;

  @Column('float')
  tax: number;

  @Column()
  taxType: 'fixed' | 'percent';

  @Column('float')
  total: number;

  @Column({ nullable: true })
  receiptQr: string;
} 