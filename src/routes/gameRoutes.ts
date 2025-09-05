import { Router } from 'express';
import { GameController } from '../controllers/gameController';

const router = Router();
const gameController = new GameController();

// 게임 관련 라우트
router.post('/', (req, res) => gameController.createGame(req, res));            // 게임 생성
router.get('/', (req, res) => gameController.getAllGames(req, res));            // 모든 게임 조회
router.get('/waiting', (req, res) => gameController.getWaitingGames(req, res)); // 대기 중인 게임
router.get('/:gameId', (req, res) => gameController.getGame(req, res));         // 특정 게임 조회
router.post('/:gameId/join', (req, res) => gameController.joinGame(req, res));  // 게임 참가

export default router;