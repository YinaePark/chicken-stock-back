import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { PlayerEntity } from './PlayerEntity';

@Entity({ name: 'games' })
export class GameEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('text')
  status!: 'WAITING' | 'STARTED' | 'ENDED';

  @OneToMany(() => PlayerEntity, (player) => player.game)
  players!: PlayerEntity[];

  @Column('int', { name: 'max_players' })
  maxPlayers!: number;

  @Column('int', { name: 'current_round' })
  currentRound!: number;

  @Column('int', { name: 'total_rounds' })
  totalRounds!: number;

  @Column('timestamptz', { name: 'created_at' })
  createdAt!: Date;

  @Column('timestamptz', { name: 'start_time', nullable: true })
  startTime?: Date | null;

  @Column('timestamptz', { name: 'end_time', nullable: true })
  endTime?: Date | null;
}


