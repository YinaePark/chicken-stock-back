import { v4 as uuidv4 } from 'uuid';
import { Game, Player } from '../models/game';
import { CreateGameRequest, JoinGameRequest } from '../models/api';
import { GameRepository } from '../repositories/gameRepository';

export class GameService {
  private gameRepository: GameRepository;

  constructor() {
    this.gameRepository = new GameRepository();
  }

  // 게임 생성
  async createGame(request: CreateGameRequest): Promise<Game> {
    // 닉네임 검증
    this.validateNickname(request.nickname);

    const gameId = uuidv4();
    const playerId = uuidv4();

    // 게임 생성
    const game: Game = {
      id: gameId,
      status: 'WAITING',
      players: [],
      maxPlayers: 4,
      currentRound: 0,
      totalRounds: 5,
      createdAt: new Date()
    };

    // 첫 번째 플레이어 생성
    const player: Player = {
      id: playerId,
      gameId: gameId,
      nickname: request.nickname,
      cash: 100000,
      portfolio: {},
      totalValue: 100000,
      isConnected: true,
      joinedAt: new Date()
    };

    // 게임에 플레이어 추가
    game.players.push(player);

    // 저장
    await this.gameRepository.saveGame(game);
    await this.gameRepository.savePlayer(player);

    console.log(`게임 생성: ${gameId}, 플레이어: ${request.nickname}`);
    return game;
  }

  // 게임 참가
  async joinGame(gameId: string, request: JoinGameRequest): Promise<Game> {
    // 게임 조회
    const game = await this.gameRepository.findGameById(gameId);
    if (!game) {
      throw new Error('게임을 찾을 수 없습니다.');
    }

    // 게임 상태 확인
    if (game.status !== 'WAITING') {
      throw new Error('이미 시작된 게임입니다.');
    }

    // 정원 확인
    if (game.players.length >= game.maxPlayers) {
      throw new Error('게임이 가득 찼습니다.');
    }

    // 닉네임 중복 확인
    const nicknameExists = game.players.some(p => p.nickname === request.nickname);
    if (nicknameExists) {
      throw new Error('이미 사용 중인 닉네임입니다.');
    }

    // 닉네임 검증
    this.validateNickname(request.nickname);

    // 새 플레이어 생성
    const playerId = uuidv4();
    const player: Player = {
      id: playerId,
      gameId: gameId,
      nickname: request.nickname,
      cash: 100000,
      portfolio: {},
      totalValue: 100000,
      isConnected: true,
      joinedAt: new Date()
    };

    // 게임에 플레이어 추가
    game.players.push(player);

    // 저장
    await this.gameRepository.saveGame(game);
    await this.gameRepository.savePlayer(player);

    console.log(`플레이어 참가: ${request.nickname} → 게임 ${gameId}`);

    // 4명이 모이면 게임 시작 준비
    if (game.players.length === game.maxPlayers) {
      console.log(`게임 시작 준비 완료: ${gameId} (4/4)`);
    }

    return game;
  }

  // 게임 조회
  async getGame(gameId: string): Promise<Game> {
    const game = await this.gameRepository.findGameById(gameId);
    if (!game) {
      throw new Error('게임을 찾을 수 없습니다.');
    }
    return game;
  }

  // 모든 게임 조회
  async getAllGames(): Promise<Game[]> {
    return await this.gameRepository.findAllGames();
  }

  // 대기 중인 게임 조회
  async getWaitingGames(): Promise<Game[]> {
    return await this.gameRepository.findWaitingGames();
  }

  // 닉네임 검증
  private validateNickname(nickname: string): void {
    if (!nickname || typeof nickname !== 'string') {
      throw new Error('닉네임을 입력해주세요.');
    }

    if (nickname.length < 2) {
      throw new Error('닉네임은 2글자 이상이어야 합니다.');
    }

    if (nickname.length > 20) {
      throw new Error('닉네임은 20글자 이하여야 합니다.');
    }

    const validPattern = /^[a-zA-Z0-9가-힣_-]+$/;
    if (!validPattern.test(nickname)) {
      throw new Error('닉네임에는 한글, 영문, 숫자, _, - 만 사용할 수 있습니다.');
    }
  }
}