import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../config/data-source';

export class SqlFileSeeder {
  async executeSqlFile(filename: string): Promise<void> {
    try {
      console.log(`SQL 파일 ${filename} 실행 시작...`);
      
      const sqlPath = path.join(__dirname, '../seeds', filename);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      await AppDataSource.query(sql);
      console.log(`✅ SQL 파일 ${filename} 실행 완료`);
    } catch (error) {
      console.error(`❌ SQL 파일 ${filename} 실행 오류:`, error);
      throw error;
    }
  }

  async seedStockTemplates(): Promise<void> {
    await this.executeSqlFile('stock_templates_seed.sql');
  }
}