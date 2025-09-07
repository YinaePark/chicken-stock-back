// 유저별 보유 주식
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, Index } from 'typeorm';
import { PlayerEntity } from './PlayerEntity';
import { StockTemplateEntity } from './StockTemplateEntity';

@Entity({ name: 'holdings' })
@Index(['playerId', 'stockCode'], { unique: true })
export class HoldingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'player_id' })
  playerId!: string;

  @Column('varchar', { name: 'stock_code' })
  stockCode!: string;

  @Column('int', { default: 0 })
  quantity!: number;

  @Column('decimal', { name: 'average_price', precision: 10, scale: 2 })
  averagePrice!: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => PlayerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: PlayerEntity;

  @ManyToOne(() => StockTemplateEntity, { eager: true })
  @JoinColumn({ name: 'stock_code', referencedColumnName: 'code' })
  stockTemplate!: StockTemplateEntity;
}