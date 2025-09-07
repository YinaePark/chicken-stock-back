// src/services/tradeService.ts
import { AppDataSource } from '../config/data-source';
import { TradeEntity } from '../entities/TradeEntity';
import { PlayerEntity } from '../entities/PlayerEntity';
import { TradeRepository } from '../repositories/tradeRepository';
import { PlayerRepository } from '../repositories/playerRepository';
import { HoldingRepository } from '../repositories/holdingRepository';
import { StockGameRepository } from '../repositories/stockGameRepository';

export interface TradeRequest {
  playerId: string;
  stockCode: string;
  type: 'BUY' | 'SELL';
  quantity: number;
}

export interface PortfolioData {
  cash: number;
  totalAssetValue: number;
  profitLoss: number;
  profitRate: number;
  holdings: Array<{
    stockCode: string;
    stockName: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    currentValue: number;
    profitLoss: number;
    profitRate: number;
  }>;
}

export class TradeService {
  private tradeRepository: TradeRepository;
  private playerRepository: PlayerRepository;
  private holdingRepository: HoldingRepository;
  private stockGameRepository: StockGameRepository;

  constructor() {
    this.tradeRepository = new TradeRepository();
    this.playerRepository = new PlayerRepository();
    this.holdingRepository = new HoldingRepository();
    this.stockGameRepository = new StockGameRepository();
  }

  async executeTrade(gameId: string, tradeRequest: TradeRequest): Promise<TradeEntity> {
    return await AppDataSource.transaction(async (manager) => {
      const { playerId, stockCode, type, quantity } = tradeRequest;

      // 1. 플레이어 조회 (비관적 락)
      const player = await manager.findOne(PlayerEntity, {
        where: { id: playerId, gameId },
        lock: { mode: 'pessimistic_write' }
      });

      if (!player) {
        throw new Error('플레이어를 찾을 수 없습니다.');
      }

      // 2. 현재 주식 가격 조회
      const stockGame = await this.stockGameRepository.findByGameAndStock(gameId, stockCode);

      if (!stockGame) {
        throw new Error('해당 종목을 찾을 수 없습니다.');
      }

      const currentPrice = Number(stockGame.currentPrice);
      const totalAmount = currentPrice * quantity;

      // 3. 거래 유효성 검증
      await this.validateTrade(type, player, stockCode, quantity, totalAmount);

      // 4. 거래 실행
      if (type === 'BUY') {
        await this.executeBuy(player, stockCode, quantity, currentPrice, totalAmount);
      } else {
        await this.executeSell(player, stockCode, quantity, currentPrice, totalAmount);
      }

      // 5. 거래 내역 저장
      const trade = await this.tradeRepository.create({
        gameId,
        playerId,
        stockCode,
        type,
        quantity,
        price: currentPrice,
        totalAmount
      });

      // 6. 포트폴리오 재계산 및 순위 업데이트
      await this.updatePortfolioValue(playerId, gameId);
      await this.playerRepository.updateRanking(gameId);

      return trade;
    });
  }

  private async validateTrade(
    type: 'BUY' | 'SELL',
    player: PlayerEntity,
    stockCode: string,
    quantity: number,
    totalAmount: number
  ): Promise<void> {
    if (quantity <= 0) {
      throw new Error('거래 수량은 0보다 커야 합니다.');
    }

    if (type === 'BUY') {
      if (player.currentCash < totalAmount) {
        throw new Error(`잔고가 부족합니다. 필요: ${totalAmount.toLocaleString()}원, 보유: ${player.currentCash.toLocaleString()}원`);
      }
    } else {
      const holding = await this.holdingRepository.findByPlayerAndStock(player.id, stockCode);
      
      if (!holding || holding.quantity < quantity) {
        throw new Error(`보유 주식이 부족합니다. 필요: ${quantity}주, 보유: ${holding?.quantity || 0}주`);
      }
    }
  }

  private async executeBuy(
    player: PlayerEntity,
    stockCode: string,
    quantity: number,
    price: number,
    totalAmount: number
  ): Promise<void> {
    // 현금 차감
    await this.playerRepository.updateCash(player.id, player.currentCash - totalAmount);

    // 보유 주식 업데이트 (평균 단가 계산)
    await this.holdingRepository.incrementQuantity(player.id, stockCode, quantity, price);
  }

  private async executeSell(
    player: PlayerEntity,
    stockCode: string,
    quantity: number,
    price: number,
    totalAmount: number
  ): Promise<void> {
    // 현금 증가
    await this.playerRepository.updateCash(player.id, player.currentCash + totalAmount);

    // 보유 주식 감소
    await this.holdingRepository.decrementQuantity(player.id, stockCode, quantity);
  }

  private async updatePortfolioValue(playerId: string, gameId: string): Promise<void> {
    const player = await this.playerRepository.findById(playerId);
    if (!player) return;

    const currentPrices = await this.stockGameRepository.getCurrentPrices(gameId);
    const totalStockValue = await this.holdingRepository.getTotalStockValue(playerId, currentPrices);
    
    const totalAssetValue = player.currentCash + totalStockValue;
    
    await this.playerRepository.updateAssetValue(playerId, totalAssetValue);
  }

  async getTradeHistory(gameId: string, playerId: string): Promise<TradeEntity[]> {
    return await this.tradeRepository.findByGameAndPlayer(gameId, playerId);
  }

  async getPortfolio(gameId: string, playerId: string): Promise<PortfolioData> {
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new Error('플레이어를 찾을 수 없습니다.');
    }

    const holdings = await this.holdingRepository.findByPlayerId(playerId);
    const currentPrices = await this.stockGameRepository.getCurrentPrices(gameId);

    const holdingsWithCurrentValue = holdings.map(holding => {
      const currentPrice = currentPrices[holding.stockCode] || Number(holding.averagePrice);
      const currentValue = holding.quantity * currentPrice;
      const averageValue = holding.quantity * Number(holding.averagePrice);
      const profitLoss = currentValue - averageValue;
      const profitRate = averageValue > 0 ? (profitLoss / averageValue) * 100 : 0;

      return {
        stockCode: holding.stockCode,
        stockName: holding.stockTemplate.name,
        quantity: holding.quantity,
        averagePrice: Number(holding.averagePrice),
        currentPrice,
        currentValue,
        profitLoss,
        profitRate: Math.round(profitRate * 100) / 100
      };
    });

    return {
      cash: player.currentCash,
      totalAssetValue: player.totalAssetValue,
      profitLoss: player.profitLoss,
      profitRate: Number(player.profitRate),
      holdings: holdingsWithCurrentValue
    };
  }

  async getGameTrades(gameId: string, limit?: number): Promise<TradeEntity[]> {
    const trades = await this.tradeRepository.findByGameId(gameId);
    return limit ? trades.slice(0, limit) : trades;
  }

  async getRecentTrades(gameId: string, limit: number = 10): Promise<TradeEntity[]> {
    return await this.tradeRepository.getRecentTrades(gameId, limit);
  }

  async getPlayerTradingStats(playerId: string) {
    const totalTrades = await this.tradeRepository.getPlayerTradeCount(playerId);
    const trades = await this.tradeRepository.findByPlayerId(playerId);
    
    const buyTrades = trades.filter(t => t.type === 'BUY');
    const sellTrades = trades.filter(t => t.type === 'SELL');
    
    const totalBuyVolume = buyTrades.reduce((sum, t) => sum + Number(t.totalAmount), 0);
    const totalSellVolume = sellTrades.reduce((sum, t) => sum + Number(t.totalAmount), 0);

    return {
      totalTrades,
      buyTrades: buyTrades.length,
      sellTrades: sellTrades.length,
      totalBuyVolume,
      totalSellVolume,
      netVolume: totalSellVolume - totalBuyVolume
    };
  }

  async validateTradeRequest(gameId: string, playerId: string, tradeRequest: Omit<TradeRequest, 'playerId'>): Promise<{
    isValid: boolean;
    error?: string;
    estimatedCost?: number;
  }> {
    try {
      const player = await this.playerRepository.findById(playerId);
      if (!player) {
        return { isValid: false, error: '플레이어를 찾을 수 없습니다.' };
      }

      const stockGame = await this.stockGameRepository.findByGameAndStock(gameId, tradeRequest.stockCode);
      if (!stockGame) {
        return { isValid: false, error: '해당 종목을 찾을 수 없습니다.' };
      }

      const currentPrice = Number(stockGame.currentPrice);
      const estimatedCost = currentPrice * tradeRequest.quantity;

      if (tradeRequest.type === 'BUY') {
        if (player.currentCash < estimatedCost) {
          return { 
            isValid: false, 
            error: '잔고가 부족합니다.',
            estimatedCost 
          };
        }
      } else {
        const holding = await this.holdingRepository.findByPlayerAndStock(playerId, tradeRequest.stockCode);
        if (!holding || holding.quantity < tradeRequest.quantity) {
          return { 
            isValid: false, 
            error: '보유 주식이 부족합니다.',
            estimatedCost 
          };
        }
      }

      return { isValid: true, estimatedCost };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : '검증 중 오류가 발생했습니다.' 
      };
    }
  }
}