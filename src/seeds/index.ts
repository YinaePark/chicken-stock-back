import { AppDataSource } from '../config/data-source';
import { SqlFileSeeder } from './sqlFileSeeder';

async function runSeeders() {
  try {
    console.log('데이터베이스 연결 시도...');
    await AppDataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    const sqlSeeder = new SqlFileSeeder();
    await sqlSeeder.seedStockTemplates();

    console.log('🎉 모든 시딩 완료!');
  } catch (error) {
    console.error('❌ 시딩 중 오류 발생:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('데이터베이스 연결 종료');
  }
}

runSeeders();