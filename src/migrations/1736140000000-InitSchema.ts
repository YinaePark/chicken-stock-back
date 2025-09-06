// command : npm run migration:run

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1736140000000 implements MigrationInterface {
  name = 'InitSchema1736140000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    
    // users 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nickname VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);

    // stock_templates 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stock_templates (
        code VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        sector VARCHAR(20) NOT NULL CHECK (sector IN ('엔터', '전자', '바이오', '통신', '은행', '건설')),
        description TEXT NOT NULL,
        volatility VARCHAR(10) NOT NULL CHECK (volatility IN ('낮음', '보통', '높음')),
        difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('쉬움', '보통', '어려움')),
        market_sensitivities JSONB NOT NULL,
        bull_events JSONB NOT NULL,
        bear_events JSONB NOT NULL,
        base_price DECIMAL(10,2) NOT NULL DEFAULT 50000,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);

    // games 테이블 (수정됨)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS games (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
        max_players INTEGER NOT NULL DEFAULT 4,
        current_round INTEGER NOT NULL DEFAULT 0,
        total_rounds INTEGER NOT NULL DEFAULT 10,
        game_duration INTEGER NOT NULL DEFAULT 480,
        tick_interval INTEGER NOT NULL DEFAULT 15,
        start_capital BIGINT NOT NULL DEFAULT 1000000,
        started_at TIMESTAMPTZ NULL,
        ended_at TIMESTAMPTZ NULL,
        host_user_id UUID NOT NULL REFERENCES users(id),
        room_code VARCHAR(6) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);

    // players 테이블 (수정됨)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        nickname VARCHAR(50) NOT NULL,
        current_cash BIGINT NOT NULL DEFAULT 1000000,
        total_asset_value BIGINT NOT NULL DEFAULT 1000000,
        profit_loss BIGINT NOT NULL DEFAULT 0,
        profit_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
        ranking INTEGER NULL,
        character_appearance JSONB NULL,
        is_ready BOOLEAN NOT NULL DEFAULT FALSE,
        is_connected BOOLEAN NOT NULL DEFAULT TRUE,
        socket_id VARCHAR(255) NULL,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_user_game UNIQUE (user_id, game_id),
        CONSTRAINT uq_game_nickname UNIQUE (game_id, nickname)
      )`);

    // 인덱스 생성
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_stock_templates_sector ON stock_templates(sector);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_stock_templates_difficulty ON stock_templates(difficulty);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_games_room_code ON games(room_code);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_players_socket_id ON players(socket_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 삭제
    await queryRunner.query(`DROP INDEX IF EXISTS idx_players_socket_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_players_user_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_players_game_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_games_room_code;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_games_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_stock_templates_difficulty;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_stock_templates_sector;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_nickname;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);

    // 테이블 삭제 (외래키 순서 고려)
    await queryRunner.query(`DROP TABLE IF EXISTS players;`);
    await queryRunner.query(`DROP TABLE IF EXISTS games;`);
    await queryRunner.query(`DROP TABLE IF EXISTS stock_templates;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}