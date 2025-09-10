import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { HoldingEntity } from '../entities/HoldingEntity';

export class HoldingRepository {
  private repository: Repository<HoldingEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(HoldingEntity);
  }

  async create(holdingData: Partial<HoldingEntity>): Promise<HoldingEntity> {
    const holding = this.repository.create(holdingData);
    return await this.repository.save(holding);
  }

  async findByPlayerAndStock(playerId: string, stockCode: string): Promise<HoldingEntity | null> {
    return await this.repository.findOne({
      where: { playerId, stockCode },
      relations: ['stockTemplate']
    });
  }

  async findByPlayerId(playerId: string): Promise<HoldingEntity[]> {
    return await this.repository.find({
      where: { playerId },
      relations: ['stockTemplate'],
      order: { stockCode: 'ASC' }
    });
  }

  async update(id: string, updateData: Partial<HoldingEntity>): Promise<void> {
    await this.repository.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async upsert(holdingData: Partial<HoldingEntity>): Promise<HoldingEntity> {
    const existing = await this.findByPlayerAndStock(
      holdingData.playerId!,
      holdingData.stockCode!
    );

    if (existing) {
      await this.update(existing.id, holdingData);
      return existing;
    } else {
      return await this.create(holdingData);
    }
  }

  async incrementQuantity(
    playerId: string,
    stockCode: string,
    quantity: number,
    averagePrice: number
  ): Promise<void> {
    const existing = await this.findByPlayerAndStock(playerId, stockCode);
    
    if (existing) {
      // 기존 보유량과 평균 단가 계산
      const totalQuantity = existing.quantity + quantity;
      const totalValue = (existing.quantity * Number(existing.averagePrice)) + (quantity * averagePrice);
      const newAveragePrice = totalValue / totalQuantity;

      await this.update(existing.id, {
        quantity: totalQuantity,
        averagePrice: newAveragePrice
      });
    } else {
      await this.create({
        playerId,
        stockCode,
        quantity,
        averagePrice
      });
    }
  }

  async decrementQuantity(playerId: string, stockCode: string, quantity: number): Promise<void> {
    const existing = await this.findByPlayerAndStock(playerId, stockCode);
    
    if (!existing) {
      throw new Error('보유 주식을 찾을 수 없습니다.');
    }

    if (existing.quantity < quantity) {
      throw new Error('보유 수량이 부족합니다.');
    }

    if (existing.quantity === quantity) {
      // 전량 매도
      await this.delete(existing.id);
    } else {
      // 일부 매도
      await this.update(existing.id, {
        quantity: existing.quantity - quantity
      });
    }
  }

  async getTotalStockValue(playerId: string, currentPrices: Record<string, number>): Promise<number> {
    const holdings = await this.findByPlayerId(playerId);
    
    return holdings.reduce((total, holding) => {
      const currentPrice = currentPrices[holding.stockCode] || Number(holding.averagePrice);
      return total + (holding.quantity * currentPrice);
    }, 0);
  }

  async deleteByPlayerId(playerId: string): Promise<void> {
    await this.repository.delete({ playerId });
  }
}