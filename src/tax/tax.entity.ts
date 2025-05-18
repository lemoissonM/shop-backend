import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Tax {
  @PrimaryColumn('varchar')
  id: string;

  @Column()
  shopId: string;

  @Column()
  name: string;

  @Column('float')
  percentage: number;

  @Column()
  type: 'fixed' | 'percent';
} 