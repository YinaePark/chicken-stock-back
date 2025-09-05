import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GameEntity } from './GameEntity';

@Entity({ name: 'players' })
export class PlayerEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'game_id' })
  gameId!: string;

  @ManyToOne(() => GameEntity, (game) => game.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game!: GameEntity;

  @Column('text')
  nickname!: string;

  @Column('bigint')
  cash!: number;

  @Column('jsonb')
  portfolio!: Record<string, number>;

  @Column('bigint', { name: 'total_value' })
  totalValue!: number;

  @Column('boolean', { name: 'is_connected' })
  isConnected!: boolean;

  @Column('timestamptz', { name: 'joined_at' })
  joinedAt!: Date;
}


