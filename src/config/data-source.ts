import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { GameEntity } from '../entities/GameEntity';
import { PlayerEntity } from '../entities/PlayerEntity';
import { UserEntity } from '../entities/UserEntity';
import { StockTemplateEntity } from '../entities/StockTemplateEntity';
import { StockGameEntity } from '../entities/StockGameEntity';
import { TradeEntity } from '../entities/TradeEntity';
import { HoldingEntity } from '../entities/HoldingEntity';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const host = process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost';
const port = process.env.PGPORT ? Number(process.env.PGPORT) : (process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432);
const username = process.env.PGUSER || process.env.POSTGRES_USER || 'postgres';
const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || 'postgres';
const database = process.env.PGDATABASE || process.env.POSTGRES_DB || 'chicken_stock';

export const AppDataSource = new DataSource(
   connectionString
    ? {
        type: 'postgres',
        url: connectionString,
        synchronize: process.env.NODE_ENV !== 'production', // 운영에서는 false
        logging: false,
        // process.env.NODE_ENV === 'development',
        entities: [
          GameEntity,
          PlayerEntity,
          UserEntity,
          StockTemplateEntity,
          StockGameEntity,
          TradeEntity,
          HoldingEntity
        ],
        migrations: ['src/migrations/*.{ts,js}'],
        migrationsRun: true,
        // 연결 풀 설정
        extra: {
          max: 20, // 최대 연결 수
          min: 5,  // 최소 연결 수
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        }
      }
    : {
        type: 'postgres',
        host,
        port,
        username,
        password,
        database,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: false,
        // process.env.NODE_ENV === 'development',
        entities: [
          GameEntity,
          PlayerEntity,
          UserEntity,
          StockTemplateEntity,
          StockGameEntity,
          TradeEntity,
          HoldingEntity
        ],
        migrations: ['src/migrations/*.{ts,js}'],
        migrationsRun: true,
        // 연결 풀 설정
        extra: {
          max: 20,
          min: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        }
      }
);


