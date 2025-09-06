import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { StockTemplateEntity, Sector, Difficulty } from '../entities/StockTemplateEntity';

export class StockTemplateRepository {
  private repository: Repository<StockTemplateEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(StockTemplateEntity);
  }

  async create(templateData: Partial<StockTemplateEntity>): Promise<StockTemplateEntity> {
    const template = this.repository.create(templateData);
    return await this.repository.save(template);
  }

  async findByCode(code: string): Promise<StockTemplateEntity | null> {
    return await this.repository.findOne({ where: { code } });
  }

  async findAll(): Promise<StockTemplateEntity[]> {
    return await this.repository.find({ order: { sector: 'ASC', name: 'ASC' } });
  }

  async findBySector(sector: Sector): Promise<StockTemplateEntity[]> {
    return await this.repository.find({ 
      where: { sector },
      order: { name: 'ASC' }
    });
  }

  async findByDifficulty(difficulty: Difficulty): Promise<StockTemplateEntity[]> {
    return await this.repository.find({ 
      where: { difficulty },
      order: { name: 'ASC' }
    });
  }

  // 게임용 랜덤 5개 선택 (난이도별 균형)
  async selectRandomForGame(): Promise<StockTemplateEntity[]> {
    const queries = [
      // 쉬움 2개
      this.repository.createQueryBuilder('stock')
        .where('stock.difficulty = :difficulty', { difficulty: Difficulty.EASY })
        .orderBy('RANDOM()')
        .limit(2)
        .getMany(),
      
      // 보통 2개  
      this.repository.createQueryBuilder('stock')
        .where('stock.difficulty = :difficulty', { difficulty: Difficulty.MEDIUM })
        .orderBy('RANDOM()')
        .limit(2)
        .getMany(),
      
      // 어려움 1개
      this.repository.createQueryBuilder('stock')
        .where('stock.difficulty = :difficulty', { difficulty: Difficulty.HARD })
        .orderBy('RANDOM()')
        .limit(1)
        .getMany()
    ];

    const results = await Promise.all(queries);
    const allResults = results.flat().filter(stock => stock !== undefined);
    return allResults;
  }

  // 섹터별 균형 잡힌 선택
  async selectBalancedForGame(): Promise<StockTemplateEntity[]> {
    const sectors = Object.values(Sector);
    const selectedStocks: StockTemplateEntity[] = [];

    // 각 섹터에서 최대 1개씩 선택
    for (const sector of sectors) {
      const sectorStocks = await this.repository.createQueryBuilder('stock')
        .where('stock.sector = :sector', { sector })
        .orderBy('RANDOM()')
        .limit(1)
        .getMany();
      
      if (sectorStocks && sectorStocks.length > 0) {
        selectedStocks.push(...sectorStocks);
      }
    }

    // 5개가 안 되면 나머지는 랜덤으로 채움
    if (selectedStocks.length < 5) {
      const selectedCodes = selectedStocks.map(s => s.code);
      const whereCondition = selectedCodes.length > 0 ? 
        'stock.code NOT IN (:...codes)' : '1=1';
      
      const additionalStocks = await this.repository.createQueryBuilder('stock')
        .where(whereCondition, { codes: selectedCodes })
        .orderBy('RANDOM()')
        .limit(5 - selectedStocks.length)
        .getMany();
      
      if (additionalStocks) {
        selectedStocks.push(...additionalStocks);
      }
    }

    return selectedStocks.slice(0, 5);
  }

  async update(code: string, updateData: Partial<StockTemplateEntity>): Promise<void> {
    await this.repository.update(code, updateData);
  }

  async delete(code: string): Promise<void> {
    await this.repository.delete(code);
  }
}