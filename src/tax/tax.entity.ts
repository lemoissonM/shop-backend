import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Tax {
  @PrimaryGeneratedColumn('uuid')
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