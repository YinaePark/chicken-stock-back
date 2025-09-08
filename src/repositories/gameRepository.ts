import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { GameEntity, GameStatus } from '../entities/GameEntity';

export class GameRepository {
  private repository: Repository<GameEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(GameEntity);
  }

  async create(gameData: Partial<GameEntity>): Promise<GameEntity> {
    const game = this.repository.create(gameData);
    return await this.repository.save(game);
  }

  async findById(id: string): Promise<GameEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['players']
    });
  }

  async findByRoomCode(roomCode: string): Promise<GameEntity | null> {
    return await this.repository.findOne({
      where: { roomCode },
      relations: ['players']
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

  async update(id: string, updateData: Partial<GameEntity>): Promise<void> {
    await this.repository.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async incrementPlayerCount(gameId: string): Promise<void> {
    await this.repository.increment({ id: gameId }, 'currentPlayers', 1);
  }

  async decrementPlayerCount(gameId: string): Promise<void> {
    await this.repository.decrement({ id: gameId }, 'currentPlayers', 1);
  }

  async isRoomCodeExists(roomCode: string): Promise<boolean> {
    const count = await this.repository.count({ where: { roomCode } });
    return count > 0;
  }

  async startGame(gameId: string): Promise<void> {
    await this.repository.update(gameId, {
      status: GameStatus.PLAYING,
      startedAt: new Date()
    });
  }

  async endGame(gameId: string): Promise<void> {
    await this.repository.update(gameId, {
      status: GameStatus.FINISHED,
      endedAt: new Date()
    });
  }
}