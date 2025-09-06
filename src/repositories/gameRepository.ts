import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { GameEntity, GameStatus } from '../entities/GameEntity';

export class GameRepository {
  private repository: Repository<GameEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(GameEntity);
  }

  async create(gameData: {
    hostUserId: string;
    roomCode: string;
    maxPlayers?: number;
    gameDuration?: number;
    startCapital?: number;
  }): Promise<GameEntity> {
    const game = this.repository.create(gameData);
    return await this.repository.save(game);
  }

  async findById(id: string): Promise<GameEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByRoomCode(roomCode: string): Promise<GameEntity | null> {
    return await this.repository.findOne({ where: { roomCode } });
  }

  async findWithPlayers(id: string): Promise<GameEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['players', 'players.user']
    });
  }

  async findWaitingGames(): Promise<GameEntity[]> {
    return await this.repository.find({
      where: { status: GameStatus.WAITING },
      relations: ['players'],
      order: { createdAt: 'DESC' }
    });
  }

  async findActiveGames(): Promise<GameEntity[]> {
    return await this.repository.find({
      where: { status: GameStatus.PLAYING },
      relations: ['players'],
      order: { startedAt: 'DESC' }
    });
  }

  async updateStatus(id: string, status: GameStatus): Promise<void> {
    await this.repository.update(id, { status });
  }

  async startGame(id: string): Promise<void> {
    await this.repository.update(id, {
      status: GameStatus.PLAYING,
      startedAt: new Date()
    });
  }

  async endGame(id: string): Promise<void> {
    await this.repository.update(id, {
      status: GameStatus.FINISHED,
      endedAt: new Date()
    });
  }

  async updateRound(id: string, round: number): Promise<void> {
    await this.repository.update(id, { currentRound: round });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async generateUniqueRoomCode(): Promise<string> {
    let roomCode: string;
    let exists: boolean;
    
    do {
      roomCode = this.generateRoomCode();
      exists = await this.checkRoomCodeExists(roomCode);
    } while (exists);
    
    return roomCode;
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async checkRoomCodeExists(roomCode: string): Promise<boolean> {
    const count = await this.repository.count({ where: { roomCode } });
    return count > 0;
  }

  async getPlayerCount(gameId: string): Promise<number> {
    const game = await this.repository.findOne({
      where: { id: gameId },
      relations: ['players']
    });
    return game?.players?.length || 0;
  }

  async canJoinGame(gameId: string): Promise<boolean> {
    const game = await this.findWithPlayers(gameId);
    if (!game || game.status !== GameStatus.WAITING) {
      return false;
    }
    return game.players.length < game.maxPlayers;
  }
}