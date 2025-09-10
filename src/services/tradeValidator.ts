import { EntityManager } from 'typeorm';
import { PlayerEntity } from '../entities/PlayerEntity';
import { HoldingEntity } from '../entities/HoldingEntity';
import { 
  InvalidQuantityException,
  InsufficientFundsException,
  InsufficientStockException, 
  PlayerNotFoundException,
  StockNotFoundException
} from '../exceptions/tradeExceptions';

export class TradeValidator {
  static async validateTradeWithManager(
    manager: EntityManager,
    type: 'BUY' | 'SELL',
    player: PlayerEntity,
    stockCode: string,
    quantity: number,
    totalAmount: number
  ): Promise<void> {
    if (quantity <= 0) {
      throw new InvalidQuantityException();
    }

    if (type === 'BUY') {
      this.validateBuyTrade(player, totalAmount);
    } else {
      await this.validateSellTrade(manager, player, stockCode, quantity);
    }
  }

  private static validateBuyTrade(player: PlayerEntity, totalAmount: number): void {
    if (player.currentCash < totalAmount) {
      throw new InsufficientFundsException(totalAmount, player.currentCash);
    }
  }

  private static async validateSellTrade(
    manager: EntityManager,
    player: PlayerEntity,
    stockCode: string,
    quantity: number
  ): Promise<void> {
    const holding = await manager.findOne(HoldingEntity, {
      where: { playerId: player.id, stockCode }
    });

    if (!holding || holding.quantity < quantity) {
      throw new InsufficientStockException(quantity, holding?.quantity || 0);
    }
  }

  static async validateTradeRequest(
    player: PlayerEntity | null,
    stockGame: any,
    tradeRequest: { type: 'BUY' | 'SELL'; quantity: number },
    holding?: HoldingEntity | null
  ): Promise<{ estimatedCost: number }> {
    if (!player) {
      throw new PlayerNotFoundException();
    }

    if (!stockGame) {
      throw new StockNotFoundException();
    }

    const currentPrice = Number(stockGame.currentPrice);
    const estimatedCost = currentPrice * tradeRequest.quantity;

    if (tradeRequest.quantity <= 0) {
      throw new InvalidQuantityException();
    }

    if (tradeRequest.type === 'BUY') {
      if (player.currentCash < estimatedCost) {
        throw new InsufficientFundsException(estimatedCost, player.currentCash);
      }
    } else {
      if (!holding || holding.quantity < tradeRequest.quantity) {
        throw new InsufficientStockException(tradeRequest.quantity, holding?.quantity || 0);
      }
    }

    return { estimatedCost };
  }
}
