import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { GameEntity } from '../entities/GameEntity';
import { PlayerEntity } from '../entities/PlayerEntity';

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
        synchronize: false,
        logging: false,
        entities: [GameEntity, PlayerEntity],
        migrations: ['src/migrations/*.{ts,js}'],
        migrationsRun: true,
      }
    : {
        type: 'postgres',
        host,
        port,
        username,
        password,
        database,
        synchronize: false,
        logging: false,
        entities: [GameEntity, PlayerEntity],
        migrations: ['src/migrations/*.{ts,js}'],
        migrationsRun: true,
      }
);


