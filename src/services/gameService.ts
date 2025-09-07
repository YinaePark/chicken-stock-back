// src/services/gameService.ts
import { AppDataSource } from '../config/data-source';
import { GameEntity, GameStatus } from '../entities/GameEntity';
import { PlayerEntity } from '../entities/PlayerEntity';
import { StockTemplateEntity } from '../entities/StockTemplateEntity';
import { GameRepository } from '../repositories/gameRepository';
import { PlayerRepository } from '../repositories/playerRepository';
import { StockGameRepository } from '../repositories/stockGameRepository';
import { StockTemplateRepository } from '../repositories/stockTemplateRepository';

export class GameService {
  private gameRepository: GameRepository;
  private playerRepository: PlayerRepository;
  private stockGameRepository: StockGameRepository;
  private stockTemplateRepository: StockTemplateRepository;

  constructor() {
    this.gameRepository = new GameRepository();
    this.playerRepository = new PlayerRepository();
    this.stockGameRepository = new StockGameRepository();
    this.stockTemplateRepository = new StockTemplateRepository();
  }

  async createGame(creatorId: string, title: string): Promise<GameEntity> {
    return await AppDataSource.transaction(async (manager) => {
      // 중복되지 않는 roomCode 생성
      let roomCode: string;
      let attempts = 0;
      
      do {
        roomCode = this.generateRoomCode();
        attempts++;
        if (attempts > 10) throw new Error('방 코드 생성 실패');
      } while (await this.gameRepository.isRoomCodeExists(roomCode));

      // 게임 생성
      const game = await this.gameRepository.create({
        title,
        status: GameStatus.WAITING,
        maxPlayers: 4,
        currentPlayers: 0,
        hostUserId: creatorId,
        roomCode,
        totalRounds: 60, // 15분 게임
        gameDuration: 900 // 15분 = 900초
      });

      // 랜덤하게 8개 종목 선택
      const allStocks = await this.stockTemplateRepository.findAll();
      const selectedStocks = this.selectRandomStocks(allStocks, 8);

      // 게임별 종목 정보 생성
      const stockGamesData = selectedStocks.map(stock => ({
        gameId: game.id,
        stockCode: stock.code,
        initialPrice: stock.basePrice,
        currentPrice: stock.basePrice,
        volatility: typeof stock.volatility === 'number' ? stock.volatility : Number(stock.volatility) || 0.03
      }));

      await this.stockGameRepository.createBatch(stockGamesData);

      // 생성자를 첫 번째 플레이어로 추가
      await this.playerRepository.create({
        userId: creatorId,
        gameId: game.id,
        nickname: `Host`,
        currentCash: 1000000,
        totalAssetValue: 1000000,
        isReady: false
      });

      await this.gameRepository.incrementPlayerCount(game.id);

      return game;
    });
  }

  async joinGame(gameId: string, userId: string, nickname: string): Promise<PlayerEntity> {
    return await AppDataSource.transaction(async (manager) => {
      const game = await this.gameRepository.findById(gameId);
      
      if (!game) {
        throw new Error('게임을 찾을 수 없습니다.');
      }
      
      if (game.status !== GameStatus.WAITING) {
        throw new Error('게임이 이미 시작되었거나 종료되었습니다.');
      }
      
      if (game.currentPlayers >= game.maxPlayers) {
        throw new Error('게임이 가득 찼습니다.');
      }

      // 중복 참가 체크
      const existingPlayer = await this.playerRepository.findByGameAndUser(gameId, userId);
      
      if (existingPlayer) {
        throw new Error('이미 참가한 게임입니다.');
      }

      // 플레이어 추가
      const player = await this.playerRepository.create({
        userId,
        gameId,
        nickname,
        currentCash: 1000000,
        totalAssetValue: 1000000,
        isReady: false
      });

      // 게임 참가자 수 증가
      await this.gameRepository.incrementPlayerCount(gameId);

      return player;
    });
  }

  async leaveGame(gameId: string, userId: string): Promise<void> {
    return await AppDataSource.transaction(async (manager) => {
      const player = await this.playerRepository.findByGameAndUser(gameId, userId);
      
      if (!player) {
        throw new Error('참가하지 않은 게임입니다.');
      }

      const game = await this.gameRepository.findById(gameId);
      
      if (!game) {
        throw new Error('게임을 찾을 수 없습니다.');
      }

      if (game.status === GameStatus.PLAYING) {
        throw new Error('진행 중인 게임은 나갈 수 없습니다.');
      }

      // 플레이어 삭제
      await this.playerRepository.delete(player.id);
      await this.gameRepository.decrementPlayerCount(gameId);

      // 호스트가 나간 경우 게임 삭제 또는 호스트 변경
      if (game.hostUserId === userId) {
        const remainingPlayers = await this.playerRepository.findByGameId(gameId);
        
        if (remainingPlayers.length === 0) {
          // 모든 플레이어가 나간 경우 게임 삭제
          await this.stockGameRepository.deleteByGameId(gameId);
          await this.gameRepository.delete(gameId);
        } else {
          // 다른 플레이어를 호스트로 변경
          await this.gameRepository.update(gameId, {
            hostUserId: remainingPlayers[0]?.userId || undefined
          });
        }
      }
    });
  }

  async startGame(gameId: string, hostUserId: string): Promise<void> {
    const game = await this.gameRepository.findById(gameId);
    
    if (!game) {
      throw new Error('게임을 찾을 수 없습니다.');
    }

    if (game.hostUserId !== hostUserId) {
      throw new Error('게임을 시작할 권한이 없습니다.');
    }

    if (game.status !== GameStatus.WAITING) {
      throw new Error('이미 시작되었거나 종료된 게임입니다.');
    }

    if (game.currentPlayers < 2) {
      throw new Error('최소 2명의 플레이어가 필요합니다.');
    }

    // 모든 플레이어가 준비되었는지 확인
    const allReady = await this.playerRepository.getAllReadyForGame(gameId);
    if (!allReady) {
      throw new Error('모든 플레이어가 준비되지 않았습니다.');
    }

    await this.gameRepository.startGame(gameId);
  }

  async getWaitingGames(): Promise<GameEntity[]> {
    return await this.gameRepository.findWaitingGames();
  }

  async getGameById(gameId: string): Promise<GameEntity | null> {
    return await this.gameRepository.findById(gameId);
  }

  async getGameByRoomCode(roomCode: string): Promise<GameEntity | null> {
    return await this.gameRepository.findByRoomCode(roomCode);
  }

  async getGamePlayers(gameId: string): Promise<PlayerEntity[]> {
    return await this.playerRepository.findByGameId(gameId);
  }

  async getGameStocks(gameId: string) {
    return await this.stockGameRepository.findByGameId(gameId);
  }

  async setPlayerReady(gameId: string, userId: string, isReady: boolean): Promise<void> {
    const player = await this.playerRepository.findByGameAndUser(gameId, userId);
    
    if (!player) {
      throw new Error('참가하지 않은 게임입니다.');
    }

    await this.playerRepository.setReady(player.id, isReady);
  }

  async endGame(gameId: string): Promise<void> {
    await this.gameRepository.endGame(gameId);
  }

  async getGameLeaderboard(gameId: string): Promise<PlayerEntity[]> {
    return await this.playerRepository.getGameLeaderboard(gameId);
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private selectRandomStocks(stocks: StockTemplateEntity[], count: number): StockTemplateEntity[] {
    const shuffled = [...stocks].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}