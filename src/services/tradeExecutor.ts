import { EntityManager } from 'typeorm';
import { PlayerEntity } from '../entities/PlayerEntity';
import { HoldingEntity } from '../entities/HoldingEntity';

export class TradeExecutor {
  static async executeBuyWithManager(
    manager: EntityManager,
    player: PlayerEntity,
    stockCode: string,
    quantity: number,
    price: number,
    totalAmount: number
  ): Promise<void> {
    // 현금 차감
    await manager.update(PlayerEntity, 
      { id: player.id }, 
      { currentCash: Number(player.currentCash) - totalAmount }
    );

    // 보유 주식 업데이트 또는 생성
    const existingHolding = await manager.findOne(HoldingEntity, {
      where: { playerId: player.id, stockCode }
    });

    if (existingHolding) {
      await this.updateExistingHolding(manager, existingHolding, quantity, price);
    } else {
      await this.createNewHolding(manager, player.id, stockCode, quantity, price);
    }
  }

  static async executeSellWithManager(
    manager: EntityManager,
    player: PlayerEntity,
    stockCode: string,
    quantity: number,
    price: number,
    totalAmount: number
  ): Promise<void> {
    // 현금 증가
    await manager.update(PlayerEntity,
      { id: player.id },
      { currentCash: Number(player.currentCash) + totalAmount }
    );

    // 보유 주식 감소
    const holding = await manager.findOne(HoldingEntity, {
      where: { playerId: player.id, stockCode }
    });

    if (holding) {
      await this.updateHoldingAfterSell(manager, holding, quantity);
    }
  }

  private static async updateExistingHolding(
    manager: EntityManager,
    holding: HoldingEntity,
    quantity: number,
    price: number
  ): Promise<void> {
    const totalValue = (holding.quantity * Number(holding.averagePrice)) + (quantity * price);
    const newQuantity = holding.quantity + quantity;
    const newAveragePrice = totalValue / newQuantity;

    await manager.update(HoldingEntity,
      { id: holding.id },
      { quantity: newQuantity, averagePrice: newAveragePrice }
    );
  }

  private static async createNewHolding(
    manager: EntityManager,
    playerId: string,
    stockCode: string,
    quantity: number,
    price: number
  ): Promise<void> {
    const newHolding = manager.create(HoldingEntity, {
      playerId,
      stockCode,
      quantity,
      averagePrice: price
    });
    await manager.save(newHolding);
  }

  private static async updateHoldingAfterSell(
    manager: EntityManager,
    holding: HoldingEntity,
    quantity: number
  ): Promise<void> {
    const newQuantity = holding.quantity - quantity;
    
    if (newQuantity <= 0) {
      await manager.delete(HoldingEntity, { id: holding.id });
    } else {
      await manager.update(HoldingEntity,
        { id: holding.id },
        { quantity: newQuantity }
      );
    }
  }
}
