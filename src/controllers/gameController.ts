// src/controllers/gameController.ts
import { Request, Response } from 'express';
import { GameService } from '../services/gameService';
import { CreateGameRequest, JoinGameRequest, ApiResponse } from '../models/api';

export class GameController {
  private gameService: GameService;

  constructor() {
    this.gameService = new GameService();
  }

  // POST /api/games - 게임 생성
  async createGame(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateGameRequest = req.body;
      const game = await this.gameService.createGame(request);

      const response: ApiResponse = {
        success: true,
        data: game,
        message: '게임이 생성되었습니다.',
        timestamp: new Date()
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error('게임 생성 에러:', error.message);
      
      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: new Date()
      };

      res.status(400).json(response);
    }
  }

  // POST /api/games/:gameId/join - 게임 참가
  async joinGame(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const request: JoinGameRequest = req.body;
      
      if (!gameId) {
        const response: ApiResponse = {
          success: false,
          error: '게임 ID가 필요합니다.',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }
      
      const game = await this.gameService.joinGame(gameId, request);

      const response: ApiResponse = {
        success: true,
        data: game,
        message: '게임에 참가했습니다.',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error: any) {
      console.error('게임 참가 에러:', error.message);
      
      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: new Date()
      };

      res.status(400).json(response);
    }
  }

  // GET /api/games/:gameId - 게임 조회
  async getGame(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      
      if (!gameId) {
        const response: ApiResponse = {
          success: false,
          error: '게임 ID가 필요합니다.',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }
      
      const game = await this.gameService.getGame(gameId);

      const response: ApiResponse = {
        success: true,
        data: game,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error: any) {
      console.error('게임 조회 에러:', error.message);
      
      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: new Date()
      };

      res.status(404).json(response);
    }
  }

  // GET /api/games - 모든 게임 조회
  async getAllGames(req: Request, res: Response): Promise<void> {
    try {
      const games = await this.gameService.getAllGames();

      const response: ApiResponse = {
        success: true,
        data: games,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error: any) {
      console.error('게임 목록 조회 에러:', error.message);
      
      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  // GET /api/games/waiting - 대기 중인 게임 조회
  async getWaitingGames(req: Request, res: Response): Promise<void> {
    try {
      const games = await this.gameService.getWaitingGames();

      const response: ApiResponse = {
        success: true,
        data: games,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error: any) {
      console.error('대기 게임 조회 에러:', error.message);
      
      const response: ApiResponse = {
        success: false,
        error: error.message,
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }
}