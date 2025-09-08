import { Request, Response } from 'express';
import { StockTemplateRepository } from '../repositories/stockTemplateRepository';
import { StockTemplateEntity, Sector } from '../entities/StockTemplateEntity';

export class AdminController {
  private stockTemplateRepository: StockTemplateRepository;

  constructor() {
    this.stockTemplateRepository = new StockTemplateRepository();
  }

  // 모든 기업 조회
  async getAllStocks(req: Request, res: Response): Promise<void> {
    try {
      const stocks = await this.stockTemplateRepository.findAll();
      res.json({
        success: true,
        data: stocks
      });
    } catch (error) {
      console.error('기업 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '기업 목록 조회 중 오류가 발생했습니다.'
      });
    }
  }

  // 섹터별 기업 조회
  async getStocksBySector(req: Request, res: Response): Promise<void> {
    try {
      const { sector } = req.params;
      
      if (!Object.values(Sector).includes(sector as Sector)) {
        res.status(400).json({
          success: false,
          error: '유효하지 않은 섹터입니다.'
        });
        return;
      }

      const stocks = await this.stockTemplateRepository.findBySector(sector as Sector);
      res.json({
        success: true,
        data: stocks
      });
    } catch (error) {
      console.error('섹터별 기업 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '섹터별 기업 조회 중 오류가 발생했습니다.'
      });
    }
  }

  // 특정 기업 조회
  async getStock(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const stock = await this.stockTemplateRepository.findByCode(code!);
      
      if (!stock) {
        res.status(404).json({
          success: false,
          error: '기업을 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: stock
      });
    } catch (error) {
      console.error('기업 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '기업 조회 중 오류가 발생했습니다.'
      });
    }
  }

  // 기업 생성
  async createStock(req: Request, res: Response): Promise<void> {
    try {
      const stockData = req.body;

      // 기본 유효성 검사
      if (!stockData.code || !stockData.name || !stockData.sector) {
        res.status(400).json({
          success: false,
          error: '필수 필드가 누락되었습니다. (code, name, sector)'
        });
        return;
      }

      // 중복 체크
      const existing = await this.stockTemplateRepository.findByCode(stockData.code);
      if (existing) {
        res.status(409).json({
          success: false,
          error: '이미 존재하는 기업 코드입니다.'
        });
        return;
      }

      const newStock = await this.stockTemplateRepository.create(stockData);
      res.status(201).json({
        success: true,
        data: newStock
      });
    } catch (error) {
      console.error('기업 생성 오류:', error);
      res.status(500).json({
        success: false,
        error: '기업 생성 중 오류가 발생했습니다.'
      });
    }
  }

  // 기업 수정
  async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const updateData = req.body;

      const existing = await this.stockTemplateRepository.findByCode(code!);
      if (!existing) {
        res.status(404).json({
          success: false,
          error: '기업을 찾을 수 없습니다.'
        });
        return;
      }

      await this.stockTemplateRepository.update(code!, updateData);
      const updatedStock = await this.stockTemplateRepository.findByCode(code!);

      res.json({
        success: true,
        data: updatedStock
      });
    } catch (error) {
      console.error('기업 수정 오류:', error);
      res.status(500).json({
        success: false,
        error: '기업 수정 중 오류가 발생했습니다.'
      });
    }
  }

  // 기업 삭제
  async deleteStock(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      const existing = await this.stockTemplateRepository.findByCode(code!);
      if (!existing) {
        res.status(404).json({
          success: false,
          error: '기업을 찾을 수 없습니다.'
        });
        return;
      }

      await this.stockTemplateRepository.delete(code!);
      res.json({
        success: true,
        message: '기업이 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('기업 삭제 오류:', error);
      res.status(500).json({
        success: false,
        error: '기업 삭제 중 오류가 발생했습니다.'
      });
    }
  }

  // 뉴스 추가
  async addNews(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const { type, newsData } = req.body; // type: 'bull' | 'bear'

      const stock = await this.stockTemplateRepository.findByCode(code!);
      if (!stock) {
        res.status(404).json({
          success: false,
          error: '기업을 찾을 수 없습니다.'
        });
        return;
      }

      // 뉴스 추가
      if (type === 'bull') {
        stock.bullEvents.push(newsData);
      } else if (type === 'bear') {
        stock.bearEvents.push(newsData);
      } else {
        res.status(400).json({
          success: false,
          error: '유효하지 않은 뉴스 타입입니다. (bull 또는 bear)'
        });
        return;
      }

      await this.stockTemplateRepository.update(code!, {
        bullEvents: stock.bullEvents,
        bearEvents: stock.bearEvents
      });

      res.json({
        success: true,
        message: '뉴스가 성공적으로 추가되었습니다.',
        data: await this.stockTemplateRepository.findByCode(code!)
      });
    } catch (error) {
      console.error('뉴스 추가 오류:', error);
      res.status(500).json({
        success: false,
        error: '뉴스 추가 중 오류가 발생했습니다.'
      });
    }
  }

  // 뉴스 삭제
  async deleteNews(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const { type, index } = req.body; // type: 'bull' | 'bear', index: number

      const stock = await this.stockTemplateRepository.findByCode(code!);
      if (!stock) {
        res.status(404).json({
          success: false,
          error: '기업을 찾을 수 없습니다.'
        });
        return;
      }

      // 뉴스 삭제
      if (type === 'bull') {
        if (index >= 0 && index < stock.bullEvents.length) {
          stock.bullEvents.splice(index, 1);
        } else {
          res.status(400).json({
            success: false,
            error: '유효하지 않은 뉴스 인덱스입니다.'
          });
          return;
        }
      } else if (type === 'bear') {
        if (index >= 0 && index < stock.bearEvents.length) {
          stock.bearEvents.splice(index, 1);
        } else {
          res.status(400).json({
            success: false,
            error: '유효하지 않은 뉴스 인덱스입니다.'
          });
          return;
        }
      } else {
        res.status(400).json({
          success: false,
          error: '유효하지 않은 뉴스 타입입니다. (bull 또는 bear)'
        });
        return;
      }

      await this.stockTemplateRepository.update(code!, {
        bullEvents: stock.bullEvents,
        bearEvents: stock.bearEvents
      });

      res.json({
        success: true,
        message: '뉴스가 성공적으로 삭제되었습니다.',
        data: await this.stockTemplateRepository.findByCode(code!)
      });
    } catch (error) {
      console.error('뉴스 삭제 오류:', error);
      res.status(500).json({
        success: false,
        error: '뉴스 삭제 중 오류가 발생했습니다.'
      });
    }
  }
}