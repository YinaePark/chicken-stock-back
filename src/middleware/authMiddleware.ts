import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';

export class AuthMiddleware {
  private userRepository: UserRepository;
  private jwtSecret: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'chicken-stock-game-secret';
  }

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: '인증 토큰이 필요합니다.'
        });
        return;
      }

      const token = authHeader.substring(7); // 'Bearer ' 제거

      // JWT 토큰 검증
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      
      // 사용자 조회
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: '존재하지 않는 사용자입니다.'
        });
        return;
      }

      // req 객체에 사용자 정보 추가
      (req as any).user = {
        id: user.id,
        nickname: user.nickname,
        email: user.email
      };

      next();

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          error: '유효하지 않은 토큰입니다.'
        });
        return;
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: '토큰이 만료되었습니다.'
        });
        return;
      }

      console.error('인증 미들웨어 오류:', error);
      res.status(500).json({
        success: false,
        error: '서버 내부 오류가 발생했습니다.'
      });
    }
  };
}