import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  ownerId: string;

  @Column({ default: false })
  hasOneTimePayment: boolean;

  @Column({ nullable: true })
  oneTimePaymentAmount: number;

  @Column({ nullable: true })
  oneTimePaymentDate: Date;
}
