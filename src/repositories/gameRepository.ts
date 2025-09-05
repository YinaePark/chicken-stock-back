import { Game, Player } from '../models/game';
import { AppDataSource } from '../config/data-source';
import { GameEntity } from '../entities/GameEntity';
import { PlayerEntity } from '../entities/PlayerEntity';

export class GameRepository {
  private gameRepo = AppDataSource.getRepository(GameEntity);
  private playerRepo = AppDataSource.getRepository(PlayerEntity);

  // 게임 저장/업서트
  async saveGame(game: Game): Promise<void> {
    const entity = this.gameRepo.create({
      id: game.id,
      status: game.status,
      maxPlayers: game.maxPlayers,
      currentRound: game.currentRound,
      totalRounds: game.totalRounds,
      createdAt: game.createdAt,
      startTime: game.startTime ?? null,
      endTime: game.endTime ?? null,
    });
    await this.gameRepo.save(entity);
  }

  // 게임 조회
  async findGameById(gameId: string): Promise<Game | null> {
    const g = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!g) return null;
    const players = await this.findPlayersByGameId(gameId);
    const game: any = {
      id: g.id,
      status: g.status,
      players,
      maxPlayers: g.maxPlayers,
      currentRound: g.currentRound,
      totalRounds: g.totalRounds,
      createdAt: g.createdAt,
    };
    if (g.startTime) game.startTime = g.startTime;
    if (g.endTime) game.endTime = g.endTime;
    return game as Game;
  }

  // 모든 게임 조회
  async findAllGames(): Promise<Game[]> {
    const rows = await this.gameRepo.find();
    const games: Game[] = [];
    for (const g of rows) {
      const players = await this.findPlayersByGameId(g.id);
      const game: any = {
        id: g.id,
        status: g.status,
        players,
        maxPlayers: g.maxPlayers,
        currentRound: g.currentRound,
        totalRounds: g.totalRounds,
        createdAt: g.createdAt,
      };
      if (g.startTime) game.startTime = g.startTime;
      if (g.endTime) game.endTime = g.endTime;
      games.push(game as Game);
    }
    return games;
  }

  // 대기 중인 게임 조회
  async findWaitingGames(): Promise<Game[]> {
    const rows = await this.gameRepo.find({ where: { status: 'WAITING' } as any });
    const games: Game[] = [];
    for (const g of rows) {
      const players = await this.findPlayersByGameId(g.id);
      const game: any = {
        id: g.id,
        status: g.status,
        players,
        maxPlayers: g.maxPlayers,
        currentRound: g.currentRound,
        totalRounds: g.totalRounds,
        createdAt: g.createdAt,
      };
      if (g.startTime) game.startTime = g.startTime;
      if (g.endTime) game.endTime = g.endTime;
      games.push(game as Game);
    }
    return games;
  }

  // 플레이어 저장/업서트
  async savePlayer(player: Player): Promise<void> {
    const entity = this.playerRepo.create({
      id: player.id,
      gameId: player.gameId,
      nickname: player.nickname,
      cash: player.cash,
      portfolio: player.portfolio,
      totalValue: player.totalValue,
      isConnected: player.isConnected,
      joinedAt: player.joinedAt,
    });
    await this.playerRepo.save(entity);
  }

  // 플레이어 조회
  async findPlayerById(playerId: string): Promise<Player | null> {
    const p = await this.playerRepo.findOne({ where: { id: playerId } });
    if (!p) return null;
    return {
      id: p.id,
      gameId: p.gameId,
      nickname: p.nickname,
      cash: Number(p.cash),
      portfolio: p.portfolio || {},
      totalValue: Number(p.totalValue),
      isConnected: p.isConnected,
      joinedAt: p.joinedAt,
    } as Player;
  }

  // 게임의 모든 플레이어 조회
  async findPlayersByGameId(gameId: string): Promise<Player[]> {
    const rows = await this.playerRepo.find({ where: { gameId } });
    return rows.map((p: PlayerEntity) => ({
      id: p.id,
      gameId: p.gameId,
      nickname: p.nickname,
      cash: Number(p.cash),
      portfolio: p.portfolio || {},
      totalValue: Number(p.totalValue),
      isConnected: p.isConnected,
      joinedAt: p.joinedAt,
    } as Player));
  }
}