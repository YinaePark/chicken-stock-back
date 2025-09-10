import { Request, Response, NextFunction } from 'express';
import { TradeException } from '../exceptions/tradeExceptions';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] ${error.name}: ${error.message}`);
  
  if (error instanceof TradeException) {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }

  return res.status(500).json({
    success: false,
    error: '서버 오류가 발생했습니다.'
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: '경로를 찾을 수 없습니다.'
  });
};