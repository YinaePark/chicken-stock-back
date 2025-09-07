// src/routes/gameRoutes.ts
import { Router } from 'express';
import { GameController } from '../controllers/gameController';
import { AuthMiddleware } from '../middleware/authMiddleware';

const router = Router();
const gameController = new GameController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Create a new game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "치킨스톡 배틀"
 *                 maxLength: 100
 *     responses:
 *       201:
 *         description: Game created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware.authenticate, (req, res) => gameController.createGame(req, res));

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Get waiting games list
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: List of waiting games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *                 count:
 *                   type: integer
 */
router.get('/', (req, res) => gameController.getWaitingGames(req, res));

/**
 * @swagger
 * /api/games/{id}/join:
 *   post:
 *     summary: Join a game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *             properties:
 *               nickname:
 *                 type: string
 *                 example: "치킨왕"
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Successfully joined game
 *       400:
 *         description: Cannot join game (full, started, etc.)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Game not found
 */
router.post('/:id/join', authMiddleware.authenticate, (req, res) => gameController.joinGame(req, res));

/**
 * @swagger
 * /api/games/{id}/leave:
 *   delete:
 *     summary: Leave a game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Successfully left game
 *       400:
 *         description: Cannot leave game (not joined, already started)
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/leave', authMiddleware.authenticate, (req, res) => gameController.leaveGame(req, res));

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     summary: Get game details
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Game details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *       404:
 *         description: Game not found
 */
router.get('/:id', (req, res) => gameController.getGame(req, res));

/**
 * @swagger
 * /api/games/{id}/players:
 *   get:
 *     summary: Get game players
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of players in the game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *                 count:
 *                   type: integer
 */
router.get('/:id/players', (req, res) => gameController.getGamePlayers(req, res));

/**
 * @swagger
 * /api/games/{id}/stocks:
 *   get:
 *     summary: Get game stocks
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of stocks in the game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StockGame'
 *                 count:
 *                   type: integer
 */
router.get('/:id/stocks', (req, res) => gameController.getGameStocks(req, res));

/**
 * @swagger
 * /api/games/{id}/trades:
 *   post:
 *     summary: Execute a trade (buy/sell stock)
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - stockCode
 *               - type
 *               - quantity
 *             properties:
 *               playerId:
 *                 type: string
 *                 format: uuid
 *               stockCode:
 *                 type: string
 *                 example: "AAPL"
 *               type:
 *                 type: string
 *                 enum: [BUY, SELL]
 *                 example: "BUY"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *     responses:
 *       200:
 *         description: Trade executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Trade'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid trade request
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/trades', authMiddleware.authenticate, (req, res) => gameController.executeTrade(req, res));

/**
 * @swagger
 * /api/games/{id}/trades/validate:
 *   post:
 *     summary: Validate a trade before execution
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - stockCode
 *               - type
 *               - quantity
 *             properties:
 *               playerId:
 *                 type: string
 *                 format: uuid
 *               stockCode:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [BUY, SELL]
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Trade validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                     error:
 *                       type: string
 *                     estimatedCost:
 *                       type: number
 */
router.post('/:id/trades/validate', authMiddleware.authenticate, (req, res) => gameController.validateTrade(req, res));

/**
 * @swagger
 * /api/games/{id}/portfolio:
 *   get:
 *     summary: Get player portfolio
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Player portfolio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 */
router.get('/:id/portfolio', authMiddleware.authenticate, (req, res) => gameController.getPortfolio(req, res));

/**
 * @swagger
 * /api/games/{id}/trades/history:
 *   get:
 *     summary: Get player trade history
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trade history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trade'
 *                 count:
 *                   type: integer
 */
router.get('/:id/trades/history', authMiddleware.authenticate, (req, res) => gameController.getTradeHistory(req, res));

/**
 * @swagger
 * /api/games/{id}/leaderboard:
 *   get:
 *     summary: Get game leaderboard
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Game leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 */
router.get('/:id/leaderboard', (req, res) => gameController.getLeaderboard(req, res));

/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         status:
 *           type: string
 *           enum: [waiting, playing, finished]
 *         maxPlayers:
 *           type: integer
 *         currentPlayers:
 *           type: integer
 *         currentRound:
 *           type: integer
 *         totalRounds:
 *           type: integer
 *         gameDuration:
 *           type: integer
 *         roomCode:
 *           type: string
 *         hostUserId:
 *           type: string
 *           format: uuid
 *         startedAt:
 *           type: string
 *           format: date-time
 *         endedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     Player:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         gameId:
 *           type: string
 *           format: uuid
 *         nickname:
 *           type: string
 *         currentCash:
 *           type: number
 *         totalAssetValue:
 *           type: number
 *         profitLoss:
 *           type: number
 *         profitRate:
 *           type: number
 *         ranking:
 *           type: integer
 *         isReady:
 *           type: boolean
 *         isConnected:
 *           type: boolean
 *         joinedAt:
 *           type: string
 *           format: date-time
 *     
 *     StockGame:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         gameId:
 *           type: string
 *           format: uuid
 *         stockCode:
 *           type: string
 *         initialPrice:
 *           type: number
 *         currentPrice:
 *           type: number
 *         volatility:
 *           type: number
 *         stockTemplate:
 *           $ref: '#/components/schemas/StockTemplate'
 *     
 *     Trade:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         gameId:
 *           type: string
 *           format: uuid
 *         playerId:
 *           type: string
 *           format: uuid
 *         stockCode:
 *           type: string
 *         type:
 *           type: string
 *           enum: [BUY, SELL]
 *         quantity:
 *           type: integer
 *         price:
 *           type: number
 *         totalAmount:
 *           type: number
 *         executedAt:
 *           type: string
 *           format: date-time
 *     
 *     Portfolio:
 *       type: object
 *       properties:
 *         cash:
 *           type: number
 *         totalAssetValue:
 *           type: number
 *         profitLoss:
 *           type: number
 *         profitRate:
 *           type: number
 *         holdings:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               stockCode:
 *                 type: string
 *               stockName:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               averagePrice:
 *                 type: number
 *               currentPrice:
 *                 type: number
 *               currentValue:
 *                 type: number
 *               profitLoss:
 *                 type: number
 *               profitRate:
 *                 type: number
 *     
 *     StockTemplate:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         sector:
 *           type: string
 *         basePrice:
 *           type: number
 *         volatility:
 *           type: number
 */

export default router;