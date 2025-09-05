import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1736140000000 implements MigrationInterface {
  name = 'InitSchema1736140000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS games (
        id UUID PRIMARY KEY,
        status TEXT NOT NULL,
        max_players INTEGER NOT NULL,
        current_round INTEGER NOT NULL,
        total_rounds INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        start_time TIMESTAMPTZ NULL,
        end_time TIMESTAMPTZ NULL
      )`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY,
        game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        nickname TEXT NOT NULL,
        cash BIGINT NOT NULL,
        portfolio JSONB NOT NULL,
        total_value BIGINT NOT NULL,
        is_connected BOOLEAN NOT NULL,
        joined_at TIMESTAMPTZ NOT NULL,
        CONSTRAINT uq_game_nickname UNIQUE (game_id, nickname)
      )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS players`);
    await queryRunner.query(`DROP TABLE IF EXISTS games`);
  }
}


