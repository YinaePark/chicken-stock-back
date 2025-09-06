import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { PlayerEntity } from '../entities/PlayerEntity';

export class PlayerRepository {
  private repository: Repository<PlayerEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(PlayerEntity);
  }

  async create(playerData: {
    userId: string;
    gameId: string;
    nickname: string;
    currentCash?: number;
    totalAssetValue?: number;
  }): Promise<PlayerEntity> {
    const player = this.repository.create(playerData);
    return await this.repository.save(player);
  }

  async findById(id: string): Promise<PlayerEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByUserAndGame(userId: string, gameId: string): Promise<PlayerEntity | null> {
    return await this.repository.findOne({
      where: { userId, gameId }
    });
  }

  async findByGameId(gameId: string): Promise<PlayerEntity[]> {
    return await this.repository.find({
      where: { gameId },
      relations: ['user'],
      order: { joinedAt: 'ASC' }
    });
  }

  async findWithUserAndGame(id: string): Promise<PlayerEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'game']
    });
  }

  async updatePortfolio(id: string, portfolioData: {
    currentCash?: number;
    totalAssetValue?: number;
    profitLoss?: number;
    profitRate?: number;
  }): Promise<void> {
    const updateData: Partial<PlayerEntity> = {};
    
    if (portfolioData.currentCash !== undefined) updateData.currentCash = portfolioData.currentCash;
    if (portfolioData.totalAssetValue !== undefined) updateData.totalAssetValue = portfolioData.totalAssetValue;
    if (portfolioData.profitLoss !== undefined) updateData.profitLoss = portfolioData.profitLoss;
    if (portfolioData.profitRate !== undefined) updateData.profitRate = portfolioData.profitRate;
    
    await this.repository.update(id, updateData);
  }

  async updateConnection(id: string, isConnected: boolean, socketId?: string): Promise<void> {
    await this.repository.update(id, { isConnected, socketId });
  }

  async setReady(id: string, isReady: boolean): Promise<void> {
    await this.repository.update(id, { isReady });
  }

  async updateCharacterAppearance(id: string, appearance: Record<string, any>): Promise<void> {
    await this.repository.update(id, { characterAppearance: appearance });
  }

  async updateRanking(gameId: string): Promise<void> {
    // 총 자산 가치 기준으로 랭킹 업데이트
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

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByUserAndGame(userId: string, gameId: string): Promise<void> {
    await this.repository.delete({ userId, gameId });
  }

  async findLeaderboard(gameId: string): Promise<PlayerEntity[]> {
    return await this.repository.find({
      where: { gameId },
      relations: ['user'],
      order: { totalAssetValue: 'DESC' }
    });
  }

  async findBySocketId(socketId: string): Promise<PlayerEntity | null> {
    return await this.repository.findOne({
      where: { socketId },
      relations: ['user', 'game']
    });
  }

  async checkUserInGame(userId: string, gameId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { userId, gameId }
    });
    return count > 0;
  }

  async getAllReadyPlayers(gameId: string): Promise<PlayerEntity[]> {
    return await this.repository.find({
      where: { gameId, isReady: true }
    });
  }

  async areAllPlayersReady(gameId: string): Promise<boolean> {
    const totalPlayers = await this.repository.count({ where: { gameId } });
    const readyPlayers = await this.repository.count({ 
      where: { gameId, isReady: true } 
    });
    
    return totalPlayers > 0 && totalPlayers === readyPlayers;
  }
}