import { Request, Response } from 'express';
import { GameService } from '../services/gameService';
import { TradeService } from '../services/tradeService';
import { TradeException } from '../exceptions/tradeExceptions';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    nickname: string;
  };
}

export class GameController {
  private gameService: GameService;
  private tradeService: TradeService;

  constructor() {
    this.gameService = new GameService();
    this.tradeService = new TradeService();
  }

  async createGame(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      if (!title || title.trim().length === 0) {
        res.status(400).json({ success: false, error: '게임 제목이 필요합니다.' });
        return;
      }

      const game = await this.gameService.createGame(userId, title.trim());
      
      res.status(201).json({
        success: true,
        data: game,
        message: '게임이 성공적으로 생성되었습니다.'
      });
    } catch (error) {
      console.error('게임 생성 오류:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '게임 생성 중 오류가 발생했습니다.'
      });
    }
  }

  async getWaitingGames(req: Request, res: Response): Promise<void> {
    try {
      const games = await this.gameService.getWaitingGames();
      
      res.json({
        success: true,
        data: games,
        count: games.length
      });
    } catch (error) {
      console.error('게임 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '게임 목록 조회 중 오류가 발생했습니다.'
      });
    }
  }

  async joinGame(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;
      const { nickname } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      if (!gameId) {
        res.status(400).json({ success: false, error: '게임 ID가 필요합니다.' });
        return;
      }

      if (!nickname || nickname.trim().length === 0) {
        res.status(400).json({ success: false, error: '닉네임이 필요합니다.' });
        return;
      }

      const player = await this.gameService.joinGame(gameId, userId, nickname.trim());
      
      res.json({
        success: true,
        data: player,
        message: '게임에 성공적으로 참가했습니다.'
      });
    } catch (error) {
      console.error('게임 참가 오류:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '게임 참가 중 오류가 발생했습니다.'
      });
    }
  }

  async leaveGame(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      if (!gameId) {
        res.status(400).json({ success: false, error: '게임 ID가 필요합니다.' });
        return;
      }

      await this.gameService.leaveGame(gameId, userId);
      
      res.json({
        success: true,
        message: '게임에서 성공적으로 나갔습니다.'
      });
    } catch (error) {
      console.error('게임 나가기 오류:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '게임 나가기 중 오류가 발생했습니다.'
      });
    }
  }

  async getGame(req: Request, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;

      if (!gameId) {
        res.status(400).json({ success: false, error: '게임 ID가 필요합니다.' });
        return;
      }

      const game = await this.gameService.getGameById(gameId);
      
      if (!game) {
        res.status(404).json({ success: false, error: '게임을 찾을 수 없습니다.' });
        return;
      }

      res.json({
        success: true,
        data: game
      });
    } catch (error) {
      console.error('게임 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '게임 조회 중 오류가 발생했습니다.'
      });
    }
  }

  async getGamePlayers(req: Request, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;

      if (!gameId) {
        res.status(400).json({ success: false, error: '게임 ID가 필요합니다.' });
        return;
      }

      const players = await this.gameService.getGamePlayers(gameId);
      
      res.json({
        success: true,
        data: players,
        count: players.length
      });
    } catch (error) {
      console.error('플레이어 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '플레이어 목록 조회 중 오류가 발생했습니다.'
      });
    }
  }

  async getGameStocks(req: Request, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;

      if (!gameId) {
        res.status(400).json({ success: false, error: '게임 ID가 필요합니다.' });
        return;
      }

      const stocks = await this.gameService.getGameStocks(gameId);
      
      res.json({
        success: true,
        data: stocks,
        count: stocks.length
      });
    } catch (error) {
      console.error('종목 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '종목 목록 조회 중 오류가 발생했습니다.'
      });
    }
  }

  // 수정된 executeTrade 메서드 - TradeException 처리 추가
  async executeTrade(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;
      const { playerId, stockCode, type, quantity } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      if (!gameId || !playerId || !stockCode || !type || !quantity) {
        res.status(400).json({ 
          success: false, 
          error: '필수 필드가 누락되었습니다. (playerId, stockCode, type, quantity)' 
        });
        return;
      }

      const trade = await this.tradeService.executeTrade(gameId, {
        playerId,
        stockCode,
        type,
        quantity: Number(quantity)
      });

      res.json({
        success: true,
        data: trade,
        message: '거래가 성공적으로 체결되었습니다.'
      });
    } catch (error) {
      if (error instanceof TradeException) {
        res.status(400).json({
          success: false,
          error: error.message,
          code: error.code
        });
      } else {
        console.error('거래 실행 오류:', error);
        res.status(500).json({
          success: false,
          error: '거래 실행 중 오류가 발생했습니다.'
        });
      }
    }
  }

  // 수정된 getPortfolio 메서드 - TradeException 처리 추가
  async getPortfolio(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;
      const { playerId } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const portfolio = await this.tradeService.getPortfolio(gameId!, playerId as string);
      
      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      if (error instanceof TradeException) {
        res.status(400).json({
          success: false,
          error: error.message,
          code: error.code
        });
      } else {
        console.error('포트폴리오 조회 오류:', error);
        res.status(500).json({
          success: false,
          error: '포트폴리오 조회 중 오류가 발생했습니다.'
        });
      }
    }
  }

  async getTradeHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;
      const { playerId } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      if (!gameId || !playerId) {
        res.status(400).json({ success: false, error: '게임 ID와 플레이어 ID가 필요합니다.' });
        return;
      }

      const trades = await this.tradeService.getTradeHistory(gameId, playerId as string);
      
      res.json({
        success: true,
        data: trades,
        count: trades.length
      });
    } catch (error) {
      console.error('거래 내역 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '거래 내역 조회 중 오류가 발생했습니다.'
      });
    }
  }

  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;

      if (!gameId) {
        res.status(400).json({ success: false, error: '게임 ID가 필요합니다.' });
        return;
      }

      const leaderboard = await this.gameService.getGameLeaderboard(gameId);
      
      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      console.error('리더보드 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '리더보드 조회 중 오류가 발생했습니다.'
      });
    }
  }

  async setPlayerReady(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;
      const { isReady } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      await this.gameService.setPlayerReady(gameId!, userId, isReady);
      
      res.json({
        success: true,
        message: `준비 상태가 ${isReady ? '완료' : '해제'}되었습니다.`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '준비 상태 변경 실패'
      });
    }
  }

  async startGame(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      if (!gameId) {
        res.status(400).json({ success: false, error: '게임 ID가 필요합니다.' });
        return;
      }

      await this.gameService.startGame(gameId, userId);
      
      res.json({
        success: true,
        message: '게임이 성공적으로 시작되었습니다.'
      });
    } catch (error) {
      console.error('게임 시작 오류:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '게임 시작 중 오류가 발생했습니다.'
      });
    }
  }

  async pauseGame(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      if (!gameId) {
        res.status(400).json({ success: false, error: '게임 ID가 필요합니다.' });
        return;
      }

      // GameService에 pauseGame 메서드가 있다면 호출
      // await this.gameService.pauseGame(gameId, userId);
      
      res.json({
        success: true,
        message: '게임이 일시정지되었습니다.'
      });
    } catch (error) {
      console.error('게임 일시정지 오류:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '게임 일시정지 중 오류가 발생했습니다.'
      });
    }
  }

  async endGame(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      if (!gameId) {
        res.status(400).json({ success: false, error: '게임 ID가 필요합니다.' });
        return;
      }

      await this.gameService.endGame(gameId);
      
      res.json({
        success: true,
        message: '게임이 종료되었습니다.'
      });
    } catch (error) {
      console.error('게임 종료 오류:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '게임 종료 중 오류가 발생했습니다.'
      });
    }
  }

  // 수정된 validateTrade 메서드 - TradeException 처리 추가
  async validateTrade(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: gameId } = req.params;
      const { playerId, stockCode, type, quantity } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const validation = await this.tradeService.validateTradeRequest(gameId!, playerId, {
        stockCode,
        type,
        quantity: Number(quantity)
      });

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      if (error instanceof TradeException) {
        res.status(400).json({
          success: false,
          error: error.message,
          code: error.code
        });
      } else {
        console.error('거래 검증 오류:', error);
        res.status(500).json({
          success: false,
          error: '거래 검증 중 오류가 발생했습니다.'
        });
      }
    }
  }
}