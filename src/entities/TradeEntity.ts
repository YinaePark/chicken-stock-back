// 거래 내역
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { PlayerEntity } from './PlayerEntity';
import { GameEntity } from './GameEntity';

@Entity({ name: 'trades' })
@Index(['playerId', 'executedAt'])
@Index(['gameId', 'stockCode'])
export class TradeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'game_id' })
  gameId!: string;

  @Column('uuid', { name: 'player_id' })
  playerId!: string;

  @Column('varchar', { name: 'stock_code' })
  stockCode!: string;

  @Column('enum', { enum: ['BUY', 'SELL'] })
  type!: 'BUY' | 'SELL';

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 15, scale: 2 })
  price!: number;

  @Column('decimal', { name: 'total_amount', precision: 15, scale: 2 })
  totalAmount!: number;

  @CreateDateColumn({ name: 'executed_at' })
  executedAt!: Date;

  @ManyToOne(() => PlayerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: PlayerEntity;

  @ManyToOne(() => GameEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game!: GameEntity;
}