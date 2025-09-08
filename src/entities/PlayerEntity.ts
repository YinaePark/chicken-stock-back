import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { GameEntity } from './GameEntity';
import { UserEntity } from './UserEntity';

@Entity({ name: 'players' })
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'user_id' })
  userId!: string;

  @Column('uuid', { name: 'game_id' })
  gameId!: string;

  @Column('varchar', { length: 50 })
  nickname!: string; // game-specific nickname

  @Column('bigint', { name: 'current_cash', default: 1000000 })
  currentCash!: number;

  @Column('bigint', { name: 'total_asset_value', default: 1000000 })
  totalAssetValue!: number;

  @Column('bigint', { name: 'profit_loss', default: 0 })
  profitLoss!: number;

  @Column('decimal', { name: 'profit_rate', precision: 12, scale: 2, default: 0 })
  profitRate!: number;

  @Column('int', { nullable: true })
  ranking?: number;

  @Column('jsonb', { name: 'character_appearance', nullable: true })
  characterAppearance?: Record<string, any>; // 닭 캐릭터 외형

  @Column('boolean', { name: 'is_ready', default: false })
  isReady!: boolean;

  @Column('boolean', { name: 'is_connected', default: true })
  isConnected!: boolean;

  @Column('varchar', { name: 'socket_id', nullable: true })
  socketId?: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt!: Date;

  // Relations
  @ManyToOne(() => UserEntity, (user) => user.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => GameEntity, (game) => game.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game!: GameEntity;
}