import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true, type: 'bigint' })
  resetTokenExpiry: number;

  @Column({ default: 0 })
  generationCredits: number;

  @Column({ default: 0 })
  aiTokens: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @OneToMany(() => UserShop, userShop => userShop.user)
  // userShops: UserShop[];
}

// UserShop entity for many-to-many relation between User and Shop
import { ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class UserShop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  shopId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // You would also add a relation to Shop here
  // @ManyToOne(() => Shop)
  // @JoinColumn({ name: 'shopId' })
  // shop: Shop;
}
