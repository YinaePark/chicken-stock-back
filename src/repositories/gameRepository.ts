import { Game, Player } from '../models/game';

export class GameRepository {
  // 임시 메모리 저장소 (나중에 DB로 교체)
  private games: Map<string, Game> = new Map();
  private players: Map<string, Player> = new Map();

  // 게임 저장
  async saveGame(game: Game): Promise<void> {
    this.games.set(game.id, game);
  }

  // 게임 조회
  async findGameById(gameId: string): Promise<Game | null> {
    return this.games.get(gameId) || null;
  }

  // 모든 게임 조회
  async findAllGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  // 대기 중인 게임 조회
  async findWaitingGames(): Promise<Game[]> {
    return Array.from(this.games.values()).filter(game => game.status === 'WAITING');
  }

  // 플레이어 저장
  async savePlayer(player: Player): Promise<void> {
    this.players.set(player.id, player);
  }

  // 플레이어 조회
  async findPlayerById(playerId: string): Promise<Player | null> {
    return this.players.get(playerId) || null;
  }

  // 게임의 모든 플레이어 조회
  async findPlayersByGameId(gameId: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.gameId === gameId);
  }
}