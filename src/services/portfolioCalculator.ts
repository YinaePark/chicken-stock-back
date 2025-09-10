import { EntityManager } from 'typeorm';
import { PlayerEntity } from '../entities/PlayerEntity';
import { HoldingEntity } from '../entities/HoldingEntity';
import { StockGameEntity } from '../entities/StockGameEntity';

export class PortfolioCalculator {
  static async updatePortfolioValueWithManager(
    manager: EntityManager,
    playerId: string,
    gameId: string
  ): Promise<void> {
    const player = await manager.findOne(PlayerEntity, { where: { id: playerId } });
    if (!player) return;

    const currentPrices = await this.getCurrentPrices(manager, gameId);
    const totalStockValue = await this.calculateTotalStockValue(manager, playerId, currentPrices);
    
    const playerCurrentCash = Number(player.currentCash);
    const totalAssetValue = playerCurrentCash + totalStockValue;
    const profitLoss = totalAssetValue - 1000000; // 초기 자본
    const profitRate = (profitLoss / 1000000) * 100;

    await manager.update(PlayerEntity, { id: playerId }, {
      totalAssetValue: Math.round(totalAssetValue),
      profitLoss: Math.round(profitLoss),
      profitRate: Math.round(profitRate * 100) / 100
    });
  }

  private static async getCurrentPrices(
    manager: EntityManager,
    gameId: string
  ): Promise<{ [key: string]: number }> {
    const stockGames = await manager.find(StockGameEntity, { where: { gameId } });
    const currentPrices: { [key: string]: number } = {};
    
    stockGames.forEach((sg: StockGameEntity) => {
      currentPrices[sg.stockCode] = Number(sg.currentPrice);
    });
    
    return currentPrices;
  }

  private static async calculateTotalStockValue(
    manager: EntityManager,
    playerId: string,
    currentPrices: { [key: string]: number }
  ): Promise<number> {
    const holdings = await manager.find(HoldingEntity, { where: { playerId } });
    
    return holdings.reduce((sum: number, holding: HoldingEntity) => {
      const currentPrice = currentPrices[holding.stockCode] || Number(holding.averagePrice);
      return sum + (holding.quantity * currentPrice);
    }, 0);
  }
}