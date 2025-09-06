import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { nickname, email, password } = req.body;

      const result = await this.authService.register({
        nickname,
        email,
        password
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('회원가입 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        error: '서버 내부 오류가 발생했습니다.'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login({
        email,
        password
      });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }

    } catch (error) {
      console.error('로그인 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        error: '서버 내부 오류가 발생했습니다.'
      });
    }
  }

  async verify(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      const result = await this.authService.verifyToken(token);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }

    } catch (error) {
      console.error('토큰 검증 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        error: '서버 내부 오류가 발생했습니다.'
      });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      // 미들웨어에서 설정된 사용자 정보 사용
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
        return;
      }

      const user = await this.authService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.'
        });
        return;
      }

      // 비밀번호 제외하고 반환
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: {
          user: userWithoutPassword
        }
      });

    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '서버 내부 오류가 발생했습니다.'
      });
    }
  }
}