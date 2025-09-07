import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PlayerEntity } from './PlayerEntity';

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished'
}

@Entity({ name: 'games' })
export class GameEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 100 })
  title!: string;

  @Column('enum', { enum: GameStatus, default: GameStatus.WAITING })
  status!: GameStatus;

  @Column('int', { name: 'max_players', default: 4 })
  maxPlayers!: number;

  @Column('int', { name: 'current_players', default: 0 })
  currentPlayers!: number;

  @Column('int', { name: 'current_round', default: 0 })
  currentRound!: number;

  @Column('int', { name: 'total_rounds', default: 32 })
  totalRounds!: number;

  @Column('int', { name: 'game_duration', default: 480 }) // seconds
  gameDuration!: number;

  @Column('int', { name: 'tick_interval', default: 15 }) // seconds
  tickInterval!: number;

  @Column('bigint', { name: 'start_capital', default: 1000000 })
  startCapital!: number;

  @Column('timestamptz', { name: 'started_at', nullable: true })
  startedAt?: Date;

  @Column('timestamptz', { name: 'ended_at', nullable: true })
  endedAt?: Date;

  @Column('uuid', { name: 'host_user_id' })
  hostUserId!: string;

  @Column('varchar', { name: 'room_code', length: 6, unique: true }) // ABC123 style
  roomCode!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => PlayerEntity, (player) => player.game)
  players!: PlayerEntity[];
}
