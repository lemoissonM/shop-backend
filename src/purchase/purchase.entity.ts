import { Entity, Column, PrimaryColumn } from 'typeorm';

export interface BulkPurchaseCost {
  name: string;
  value: number;
}

export interface BulkPurchaseItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface BulkPurchase {
  id: string;
  date: number;
  items: BulkPurchaseItem[];
  costs: BulkPurchaseCost[];
  subtotal: number;
  totalCost: number;
  total: number;
}

@Entity()
export class Purchase {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  shopId: string;

  @Column({ type: 'varchar' })
  date: number;

  @Column({ type: 'jsonb' })
  costs: BulkPurchaseCost[];

  @Column({ type: 'float' })
  totalCost: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'jsonb' })
  items: BulkPurchaseItem[];
}
