// src/repositories/playerRepository.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { PlayerEntity } from '../entities/PlayerEntity';

export class PlayerRepository {
  private repository: Repository<PlayerEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(PlayerEntity);
  }

  async create(playerData: Partial<PlayerEntity>): Promise<PlayerEntity> {
    const player = this.repository.create(playerData);
    return await this.repository.save(player);
  }

  async findById(id: string): Promise<PlayerEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'game']
    });
  }

  async findByGameId(gameId: string): Promise<PlayerEntity[]> {
    return await this.repository.find({
      where: { gameId },
      relations: ['user'],
      order: { joinedAt: 'ASC' }
    });
  }

  async findByUserId(userId: string): Promise<PlayerEntity[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['game'],
      order: { joinedAt: 'DESC' }
    });
  }

  async findByGameAndUser(gameId: string, userId: string): Promise<PlayerEntity | null> {
    return await this.repository.findOne({
      where: { gameId, userId },
      relations: ['user', 'game']
    });
  }

  async update(id: string, updateData: Partial<PlayerEntity>): Promise<void> {
    await this.repository.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getGameLeaderboard(gameId: string): Promise<PlayerEntity[]> {
    return await this.repository.find({
      where: { gameId },
      relations: ['user'],
      order: { totalAssetValue: 'DESC' }
    });
  }

  async updateCash(playerId: string, newCashAmount: number): Promise<void> {
    await this.repository.update(playerId, { currentCash: newCashAmount });
  }

  async updateAssetValue(playerId: string, totalAssetValue: number): Promise<void> {
    const profitLoss = totalAssetValue - 1000000; // 초기 자본 100만원
    const profitRate = (profitLoss / 1000000) * 100;

    await this.repository.update(playerId, {
      totalAssetValue,
      profitLoss,
      profitRate
    });
  }

  async setReady(playerId: string, isReady: boolean): Promise<void> {
    await this.repository.update(playerId, { isReady });
  }

  async setConnected(playerId: string, isConnected: boolean, socketId?: string): Promise<void> {
    const updateData: Partial<PlayerEntity> = {
      isConnected,
      socketId: isConnected && socketId ? socketId : undefined
    };
    
    await this.repository.update(playerId, updateData);
  }

  async updateRanking(gameId: string): Promise<void> {
    const players = await this.repository.find({
      where: { gameId },
      order: { totalAssetValue: 'DESC' }
    });

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (player && player.id) {
        await this.repository.update(player.id, { ranking: i + 1 });
      }
    }
  }

  async getReadyPlayersCount(gameId: string): Promise<number> {
    return await this.repository.count({
      where: { gameId, isReady: true }
    });
  }

  async getConnectedPlayersCount(gameId: string): Promise<number> {
    return await this.repository.count({
      where: { gameId, isConnected: true }
    });
  }

  async getAllReadyForGame(gameId: string): Promise<boolean> {
    const totalPlayers = await this.repository.count({ where: { gameId } });
    const readyPlayers = await this.getReadyPlayersCount(gameId);
    
    return totalPlayers > 0 && totalPlayers === readyPlayers;
  }

  async resetAllReadyStatus(gameId: string): Promise<void> {
    await this.repository.update({ gameId }, { isReady: false });
  }

  async deleteByGameId(gameId: string): Promise<void> {
    await this.repository.delete({ gameId });
  }
}