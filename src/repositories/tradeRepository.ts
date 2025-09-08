import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { TradeEntity } from '../entities/TradeEntity';

export class TradeRepository {
  private repository: Repository<TradeEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(TradeEntity);
  }

  async create(tradeData: Partial<TradeEntity>): Promise<TradeEntity> {
    const trade = this.repository.create(tradeData);
    return await this.repository.save(trade);
  }

  async findById(id: string): Promise<TradeEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['player']
    });
  }

  async findByGameId(gameId: string): Promise<TradeEntity[]> {
    return await this.repository.find({
      where: { gameId },
      relations: ['player'],
      order: { executedAt: 'DESC' }
    });
  }

  async findByPlayerId(playerId: string): Promise<TradeEntity[]> {
    return await this.repository.find({
      where: { playerId },
      relations: ['player'],
      order: { executedAt: 'DESC' }
    });
  }

  async findByGameAndPlayer(gameId: string, playerId: string): Promise<TradeEntity[]> {
    return await this.repository.find({
      where: { gameId, playerId },
      order: { executedAt: 'DESC' }
    });
  }

  async findByStockCode(gameId: string, stockCode: string): Promise<TradeEntity[]> {
    return await this.repository.find({
      where: { gameId, stockCode },
      relations: ['player'],
      order: { executedAt: 'DESC' }
    });
  }

  async findByTimeRange(gameId: string, startTime: Date, endTime: Date): Promise<TradeEntity[]> {
    return await this.repository.find({
      where: {
        gameId,
        executedAt: Between(startTime, endTime)
      },
      relations: ['player'],
      order: { executedAt: 'ASC' }
    });
  }

  async getTotalTradeVolume(gameId: string, stockCode: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('trade')
      .select('SUM(trade.quantity)', 'total')
      .where('trade.gameId = :gameId', { gameId })
      .andWhere('trade.stockCode = :stockCode', { stockCode })
      .getRawOne();
    
    return Number(result.total) || 0;
  }

  async getTotalTradeValue(gameId: string, playerId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('trade')
      .select('SUM(trade.totalAmount)', 'total')
      .where('trade.gameId = :gameId', { gameId })
      .andWhere('trade.playerId = :playerId', { playerId })
      .getRawOne();
    
    return Number(result.total) || 0;
  }

  async getPlayerTradeCount(playerId: string): Promise<number> {
    return await this.repository.count({ where: { playerId } });
  }

  async getRecentTrades(gameId: string, limit: number = 10): Promise<TradeEntity[]> {
    return await this.repository.find({
      where: { gameId },
      relations: ['player'],
      order: { executedAt: 'DESC' },
      take: limit
    });
  }
}