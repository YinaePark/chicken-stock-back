// 게임별 종목 정보
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { GameEntity } from './GameEntity';
import { StockTemplateEntity } from './StockTemplateEntity';

@Entity({ name: 'stock_games' })
@Index(['gameId', 'stockCode'], { unique: true })
export class StockGameEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'game_id' })
  gameId!: string;

  @Column('varchar', { name: 'stock_code' })
  stockCode!: string;

  @Column('decimal', { name: 'initial_price', precision: 10, scale: 2 })
  initialPrice!: number;

  @Column('decimal', { name: 'current_price', precision: 10, scale: 2 })
  currentPrice!: number;

  @Column('decimal', { name: 'volatility', precision: 5, scale: 2, default: 0.05 })
  volatility!: number;

  @ManyToOne(() => GameEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game!: GameEntity;

  @ManyToOne(() => StockTemplateEntity, { eager: true })
  @JoinColumn({ name: 'stock_code', referencedColumnName: 'code' })
  stockTemplate!: StockTemplateEntity;
}