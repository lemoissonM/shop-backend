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
}
