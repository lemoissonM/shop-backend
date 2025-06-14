import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { AiGenerationPayment } from 'src/ai-generations/entities/payment.entity';

@Entity()
export class TrainingRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  program: string;

  @Column()
  country: string;

  @Column()
  language: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  referral?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ default: 'pending' })
  status: string; // pending, confirmed, cancelled

  @OneToOne(() => AiGenerationPayment)
  @JoinColumn({ name: 'paymentId' })
  payment: AiGenerationPayment;

  @Column('uuid', { nullable: true })
  paymentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class TrainingPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  registrationId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 'pending' })
  status: string; // pending, completed, failed

  @Column({ nullable: true })
  reference: string; // PawaPay deposit ID

  @Column({ nullable: true })
  phoneNumber: string;

  @Column('json', { nullable: true })
  metadata: any;

  @OneToOne(() => TrainingRegistration)
  @JoinColumn({ name: 'registrationId' })
  registration: TrainingRegistration;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
