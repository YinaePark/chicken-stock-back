// src/app.ts - 메인 서버 파일
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
import { AppDataSource } from './config/data-source';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const PORT = 3000;

// 정적 파일 서빙 (public 폴더)
app.use(express.static(path.join(__dirname, '/public')));

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '🐔 치킨스톡게임 API 서버',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Game API',
      version: '1.0.0',
      description: 'Chicken Stock Game API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // API 파일 경로
};

const specs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API 라우트 등록
app.use('/api/auth', authRoutes); 
app.use('/api/games', gameRoutes);  
app.use('/api/admin', adminRoutes);  


// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// 서버 시작 (DB 연결 후 시작)
console.log('DB config →', process.env.DATABASE_URL
  ? { url: process.env.DATABASE_URL?.replace(/:(.*?)@/, ':***@') }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      database: process.env.PGDATABASE,
    }
);

app.use(notFoundHandler);
app.use(errorHandler);

AppDataSource.initialize()
  .then(async () => {
    console.log('✅ Database initialized');
    await AppDataSource.runMigrations();
    console.log('✅ Migrations executed');
    app.listen(PORT, () => {
      console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  })
  .catch((err: unknown) => {
    console.error('DB 초기화 실패로 서버 시작을 중단합니다.', err);
    process.exit(1);
  });

export default app;