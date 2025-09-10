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
    const stockGame = await manager.findOne(StockGameEntity, {
      where: { gameId, stockCode }
    });

    if (!stockGame) {
      throw new Error('해당 종목을 찾을 수 없습니다.');
    }

    const currentPrice = Number(stockGame.currentPrice);
    const totalAmount = currentPrice * quantity;

    // 3. 거래 유효성 검증
    await this.validateTradeWithManager(manager, type, player, stockCode, quantity, totalAmount);

    // 4. 거래 실행
    if (type === 'BUY') {
      await this.executeBuyWithManager(manager, player, stockCode, quantity, currentPrice, totalAmount);
    } else {
      await this.executeSellWithManager(manager, player, stockCode, quantity, currentPrice, totalAmount);
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
    await this.updatePortfolioValueWithManager(manager, playerId, gameId);

    return savedTrade;
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

  private async validateTradeWithManager(
  manager: any,
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
    const holding = await manager.findOne(HoldingEntity, {
      where: { playerId: player.id, stockCode }
    });
    
    if (!holding || holding.quantity < quantity) {
      throw new Error(`보유 주식이 부족합니다. 필요: ${quantity}주, 보유: ${holding?.quantity || 0}주`);
    }
  }
}

private async executeBuyWithManager(
  manager: any,
  player: PlayerEntity,
  stockCode: string,
  quantity: number,
  price: number,
  totalAmount: number
): Promise<void> {
  // 현금 차감
  await manager.update(PlayerEntity, { id: player.id }, {
    currentCash: Number(player.currentCash) - totalAmount  
  });

  // 보유 주식 업데이트 또는 생성
  const existingHolding = await manager.findOne(HoldingEntity, {
    where: { playerId: player.id, stockCode }
  });

  if (existingHolding) {
    // 기존 보유량 업데이트 (평균 단가 계산)
    const totalValue = (existingHolding.quantity * Number(existingHolding.averagePrice)) + (quantity * price);
    const newQuantity = existingHolding.quantity + quantity;
    const newAveragePrice = totalValue / newQuantity;

    await manager.update(HoldingEntity, { id: existingHolding.id }, {
      quantity: newQuantity,
      averagePrice: newAveragePrice
    });
  } else {
    // 새로운 보유 주식 생성
    const newHolding = manager.create(HoldingEntity, {
      playerId: player.id,
      stockCode,
      quantity,
      averagePrice: price
    });
    await manager.save(newHolding);
  }
}

private async executeSellWithManager(
  manager: any,
  player: PlayerEntity,
  stockCode: string,
  quantity: number,
  price: number,
  totalAmount: number
): Promise<void> {
  // 현금 증가
  await manager.update(PlayerEntity, { id: player.id }, {
    currentCash: Number(player.currentCash) + totalAmount  
  });

  // 보유 주식 감소
  const holding = await manager.findOne(HoldingEntity, {
    where: { playerId: player.id, stockCode }
  });

  if (holding) {
    const newQuantity = holding.quantity - quantity;
    
    if (newQuantity <= 0) {
      // 모든 주식을 매도한 경우 삭제
      await manager.delete(HoldingEntity, { id: holding.id });
    } else {
      // 수량만 차감
      await manager.update(HoldingEntity, { id: holding.id }, {
        quantity: newQuantity
      });
    }
  }
}

private async updatePortfolioValueWithManager(manager: any, playerId: string, gameId: string): Promise<void> {
  const player = await manager.findOne(PlayerEntity, {
    where: { id: playerId }
  });
  
  if (!player) return;

  // 현재 주식 가격들 조회
  const stockGames = await manager.find(StockGameEntity, {
    where: { gameId }
  });
  
  const currentPrices: { [key: string]: number } = {};
  stockGames.forEach((sg: StockGameEntity) => {
    currentPrices[sg.stockCode] = Number(sg.currentPrice);
  });

  // 보유 주식들 조회
  const holdings = await manager.find(HoldingEntity, {
    where: { playerId }
  });

  // 총 주식 가치 계산
  const totalStockValue = holdings.reduce((sum: number, holding: HoldingEntity) => {
    const currentPrice = currentPrices[holding.stockCode] || Number(holding.averagePrice);
    return sum + (holding.quantity * currentPrice);
  }, 0);

  // 🔥 핵심: Number() 로 명시적 변환
  const playerCurrentCash = Number(player.currentCash);
  const totalAssetValue = playerCurrentCash + totalStockValue;  // 숫자 + 숫자
  const profitLoss = totalAssetValue - 1000000;
  const profitRate = (profitLoss / 1000000) * 100;

  await manager.update(PlayerEntity, { id: playerId }, {
    totalAssetValue: Math.round(totalAssetValue),     // 정수로 변환
    profitLoss: Math.round(profitLoss),               // 정수로 변환
    profitRate: Math.round(profitRate * 100) / 100    // 소수점 2자리
  });
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