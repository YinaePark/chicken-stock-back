import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePlayerColumns1757314631800 implements MigrationInterface {
    name = 'UpdatePlayerColumns1757314631800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" ALTER COLUMN "profit_rate" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "stock_templates" ALTER COLUMN "base_price" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "stock_games" ALTER COLUMN "initial_price" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "stock_games" ALTER COLUMN "current_price" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "stock_games" ALTER COLUMN "volatility" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "stock_games" ALTER COLUMN "volatility" SET DEFAULT '0.05'`);
        await queryRunner.query(`ALTER TABLE "holdings" ALTER COLUMN "average_price" TYPE numeric(12,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "holdings" ALTER COLUMN "average_price" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "stock_games" ALTER COLUMN "volatility" SET DEFAULT 0.05`);
        await queryRunner.query(`ALTER TABLE "stock_games" ALTER COLUMN "volatility" TYPE numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "stock_games" ALTER COLUMN "current_price" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "stock_games" ALTER COLUMN "initial_price" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "stock_templates" ALTER COLUMN "base_price" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "players" ALTER COLUMN "profit_rate" TYPE numeric(8,2)`);
    }

}
