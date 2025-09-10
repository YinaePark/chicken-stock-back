// src/services/tradeService.ts
import { AppDataSource } from '../config/data-source';
import { TradeEntity } from '../entities/TradeEntity';
import { PlayerEntity } from '../entities/PlayerEntity';
import { HoldingEntity } from '../entities/HoldingEntity';
import { StockGameEntity } from '../entities/StockGameEntity';
import { TradeRepository } from '../repositories/tradeRepository';
import { PlayerRepository } from '../repositories/playerRepository';
import { HoldingRepository } from '../repositories/holdingRepository';
import { StockGameRepository } from '../repositories/stockGameRepository';
import { TradeRequest, PortfolioData } from '../interfaces/trade.interface';
import { TradeValidator } from '../services/tradeValidator';
import { TradeExecutor } from '../services/tradeExecutor';
import { PortfolioCalculator } from '../services/portfolioCalculator';
import { 
  PlayerNotFoundException, 
  StockNotFoundException,
  TradeException 
} from '../exceptions/tradeExceptions';

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
      throw new PlayerNotFoundException();
    }

    // 2. 현재 주식 가격 조회
    const stockGame = await manager.findOne(StockGameEntity, {
      where: { gameId, stockCode }
    });

    if (!stockGame) {
        throw new StockNotFoundException();
    }

    const currentPrice = Number(stockGame.currentPrice);
    const totalAmount = currentPrice * quantity;

    // 3. 거래 유효성 검증
    await TradeValidator.validateTradeWithManager(
      manager, 
      type, 
      player, 
      stockCode, 
      quantity, 
      totalAmount
    );

    // 4. 거래 실행
    if (type === 'BUY') {
      await TradeExecutor.executeBuyWithManager(
        manager, 
        player, 
        stockCode, 
        quantity, 
        currentPrice, 
        totalAmount
      );
    } else {
      await TradeExecutor.executeSellWithManager(
        manager, 
        player, 
        stockCode, 
        quantity, 
        currentPrice, 
        totalAmount
      );
    }

    // 5. 거래 내역 저장 (트랜잭션 매니저 사용)
    const trade = manager.create(TradeEntity, {
      gameId,
      playerId,
      stockCode,
      type,
      quantity,
      price: currentPrice,
      totalAmount,
      createdAt: new Date()
    });
    
    const savedTrade = await manager.save(trade);

    // 6. 포트폴리오 재계산 및 순위 업데이트
    await PortfolioCalculator.updatePortfolioValueWithManager(
      manager, 
      playerId, 
      gameId
    );

    return savedTrade;
  });
}
  
  async getTradeHistory(gameId: string, playerId: string): Promise<TradeEntity[]> {
    return await this.tradeRepository.findByGameAndPlayer(gameId, playerId);
  }

  async getPortfolio(gameId: string, playerId: string): Promise<PortfolioData> {
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new PlayerNotFoundException();
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

  async validateTradeRequest(
    gameId: string, 
    playerId: string, 
    tradeRequest: Omit<TradeRequest, 'playerId'>
  ): Promise<{
    isValid: boolean;
    error?: string;
    estimatedCost?: number;
  }> {
    try {
      const player = await this.playerRepository.findById(playerId);
      const stockGame = await this.stockGameRepository.findByGameAndStock(gameId, tradeRequest.stockCode);
      
      let holding = null;
      if (tradeRequest.type === 'SELL') {
        holding = await this.holdingRepository.findByPlayerAndStock(playerId, tradeRequest.stockCode);
      }

      const validationResult = await TradeValidator.validateTradeRequest(
        player,
        stockGame,
        tradeRequest,
        holding
      );

      return { 
        isValid: true, 
        estimatedCost: validationResult.estimatedCost 
      };
    } catch (error) {
      if (error instanceof TradeException) {
        // 커스텀 예외인 경우 에러 코드와 함께 반환
        return { 
          isValid: false, 
          error: error.message,
        };
      }
      
      // 기타 예외
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : '검증 중 오류가 발생했습니다.' 
      };
    }
  }
}