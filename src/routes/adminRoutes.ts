import { Router } from 'express';
import { AdminController } from '../controllers/adminController';

const router = Router();
const adminController = new AdminController();

// 기업 관리
router.get('/stocks', (req, res) => adminController.getAllStocks(req, res));
router.get('/stocks/sector/:sector', (req, res) => adminController.getStocksBySector(req, res));
router.get('/stocks/:code', (req, res) => adminController.getStock(req, res));
router.post('/stocks', (req, res) => adminController.createStock(req, res));
router.put('/stocks/:code', (req, res) => adminController.updateStock(req, res));
router.delete('/stocks/:code', (req, res) => adminController.deleteStock(req, res));

// 뉴스 관리
router.post('/stocks/:code/news', (req, res) => adminController.addNews(req, res));
router.delete('/stocks/:code/news', (req, res) => adminController.deleteNews(req, res));

export default router;