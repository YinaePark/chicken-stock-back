import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { StockGameEntity } from '../entities/StockGameEntity';

export class StockGameRepository {
  private repository: Repository<StockGameEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(StockGameEntity);
  }

  async create(stockGameData: Partial<StockGameEntity>): Promise<StockGameEntity> {
    const stockGame = this.repository.create(stockGameData);
    return await this.repository.save(stockGame);
  }

  async createBatch(stockGamesData: Partial<StockGameEntity>[]): Promise<StockGameEntity[]> {
    const stockGames = this.repository.create(stockGamesData);
    return await this.repository.save(stockGames);
  }

  async findByGameId(gameId: string): Promise<StockGameEntity[]> {
    return await this.repository.find({
      where: { gameId },
      relations: ['stockTemplate'],
      order: { stockCode: 'ASC' }
    });
  }

  async findByGameAndStock(gameId: string, stockCode: string): Promise<StockGameEntity | null> {
    return await this.repository.findOne({
      where: { gameId, stockCode },
      relations: ['stockTemplate']
    });
  }

  async updatePrice(gameId: string, stockCode: string, newPrice: number): Promise<void> {
    await this.repository.update(
      { gameId, stockCode },
      { currentPrice: newPrice }
    );
  }

  async updatePrices(gameId: string, priceUpdates: { stockCode: string; price: number }[]): Promise<void> {
    const promises = priceUpdates.map(update =>
      this.updatePrice(gameId, update.stockCode, update.price)
    );
    await Promise.all(promises);
  }

  async getCurrentPrices(gameId: string): Promise<Record<string, number>> {
    const stocks = await this.repository.find({
      where: { gameId },
      select: ['stockCode', 'currentPrice']
    });

    const prices: Record<string, number> = {};
    stocks.forEach(stock => {
      prices[stock.stockCode] = Number(stock.currentPrice);
    });

    return prices;
  }

  async getPriceChanges(gameId: string): Promise<Array<{
    stockCode: string;
    currentPrice: number;
    initialPrice: number;
    changePercent: number;
  }>> {
    const stocks = await this.repository.find({
      where: { gameId },
      select: ['stockCode', 'currentPrice', 'initialPrice']
    });

    return stocks.map(stock => {
      const currentPrice = Number(stock.currentPrice);
      const initialPrice = Number(stock.initialPrice);
      const changePercent = ((currentPrice - initialPrice) / initialPrice) * 100;

      return {
        stockCode: stock.stockCode,
        currentPrice,
        initialPrice,
        changePercent: Math.round(changePercent * 100) / 100
      };
    });
  }

  async getStockInfo(gameId: string, stockCode: string) {
    const stockGame = await this.repository.findOne({
      where: { gameId, stockCode },
      relations: ['stockTemplate']
    });

    if (!stockGame) {
      return null;
    }

    const currentPrice = Number(stockGame.currentPrice);
    const initialPrice = Number(stockGame.initialPrice);
    const changePercent = ((currentPrice - initialPrice) / initialPrice) * 100;

    return {
      stockCode: stockGame.stockCode,
      name: stockGame.stockTemplate.name,
      sector: stockGame.stockTemplate.sector,
      currentPrice,
      initialPrice,
      changePercent: Math.round(changePercent * 100) / 100,
      volatility: Number(stockGame.volatility)
    };
  }

  async resetPrices(gameId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(StockGameEntity)
      .set({ currentPrice: () => 'initial_price' })
      .where('gameId = :gameId', { gameId })
      .execute();
  }

  async deleteByGameId(gameId: string): Promise<void> {
    await this.repository.delete({ gameId });
  }

  async getMarketSummary(gameId: string) {
    const stocks = await this.repository.find({
      where: { gameId },
      relations: ['stockTemplate']
    });

    let totalMarketValue = 0;
    let gainers = 0;
    let losers = 0;
    let unchanged = 0;

    const stockSummary = stocks.map(stock => {
      const currentPrice = Number(stock.currentPrice);
      const initialPrice = Number(stock.initialPrice);
      const changePercent = ((currentPrice - initialPrice) / initialPrice) * 100;

      totalMarketValue += currentPrice;

      if (changePercent > 0) gainers++;
      else if (changePercent < 0) losers++;
      else unchanged++;

      return {
        stockCode: stock.stockCode,
        name: stock.stockTemplate.name,
        sector: stock.stockTemplate.sector,
        currentPrice,
        changePercent: Math.round(changePercent * 100) / 100
      };
    });

    return {
      totalStocks: stocks.length,
      totalMarketValue,
      gainers,
      losers,
      unchanged,
      stocks: stockSummary
    };
  }
}