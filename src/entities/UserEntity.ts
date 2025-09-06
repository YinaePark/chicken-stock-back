import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PlayerEntity } from './PlayerEntity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 50, unique: true })
  nickname!: string;

  @Column('varchar', { length: 255, nullable: true })
  email?: string;

  @Column('varchar', { length: 255, nullable: true })
  password?: string; 

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => PlayerEntity, (player) => player.user)
  players!: PlayerEntity[];
}