import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';
import { UserEntity } from '../entities/UserEntity';

export interface RegisterData {
  nickname: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: Omit<UserEntity, 'password'>;
    token: string;
  };
  error?: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'chicken-stock-game-secret';
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const { nickname, email, password } = registerData;

      // 입력 유효성 검사
      if (!nickname || !email || !password) {
        return {
          success: false,
          error: '닉네임, 이메일, 비밀번호를 모두 입력해주세요.'
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: '비밀번호는 최소 6자 이상이어야 합니다.'
        };
      }

      // 이메일 형식 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: '올바른 이메일 형식이 아닙니다.'
        };
      }

      // 중복 검사
      const existingEmail = await this.userRepository.checkEmailExists(email);
      if (existingEmail) {
        return {
          success: false,
          error: '이미 사용 중인 이메일입니다.'
        };
      }

      const existingNickname = await this.userRepository.checkNicknameExists(nickname);
      if (existingNickname) {
        return {
          success: false,
          error: '이미 사용 중인 닉네임입니다.'
        };
      }

      // 비밀번호 암호화
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 사용자 생성
      const user = await this.userRepository.create({
        nickname,
        email,
        password: hashedPassword
      });

      // JWT 토큰 생성
      const token = this.generateToken(user.id);

      // 비밀번호 제외하고 반환
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      };

    } catch (error) {
      console.error('회원가입 오류:', error);
      return {
        success: false,
        error: '회원가입 중 오류가 발생했습니다.'
      };
    }
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const { email, password } = loginData;

      // 입력 유효성 검사
      if (!email || !password) {
        return {
          success: false,
          error: '이메일과 비밀번호를 입력해주세요.'
        };
      }

      // 사용자 조회
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          error: '존재하지 않는 이메일입니다.'
        };
      }

      // 비밀번호 확인
      const pw = user.password;
      if(pw){
        const isPasswordValid = await bcrypt.compare(password, pw);
        if (!isPasswordValid) {
            return {
            success: false,
            error: '비밀번호가 일치하지 않습니다.'
            };
        }
      }

      // JWT 토큰 생성
      const token = this.generateToken(user.id);

      // 비밀번호 제외하고 반환
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      };

    } catch (error) {
      console.error('로그인 오류:', error);
      return {
        success: false,
        error: '로그인 중 오류가 발생했습니다.'
      };
    }
  }

  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      if (!token) {
        return {
          success: false,
          error: '토큰이 제공되지 않았습니다.'
        };
      }

      // JWT 토큰 검증
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      
      // 사용자 조회
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        return {
          success: false,
          error: '존재하지 않는 사용자입니다.'
        };
      }

      // 비밀번호 제외하고 반환
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token // 기존 토큰 그대로 반환
        }
      };

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          success: false,
          error: '유효하지 않은 토큰입니다.'
        };
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        return {
          success: false,
          error: '토큰이 만료되었습니다.'
        };
      }

      console.error('토큰 검증 오류:', error);
      return {
        success: false,
        error: '토큰 검증 중 오류가 발생했습니다.'
      };
    }
  }

  async getUserById(userId: string): Promise<UserEntity | null> {
    return await this.userRepository.findById(userId);
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.jwtSecret,
      { expiresIn: '7d' } // 7일 유효
    );
  }
}