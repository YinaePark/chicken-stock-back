// src/app.ts - 메인 서버 파일
import express from 'express';
import gameRoutes from './routes/gameRoutes';

const app = express();
const PORT = 3000;

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

// API 라우트 등록
app.use('/api/games', gameRoutes);

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `경로를 찾을 수 없습니다: ${req.originalUrl}`,
    timestamp: new Date()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

export default app;