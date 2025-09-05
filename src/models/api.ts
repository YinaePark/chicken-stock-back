export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface CreateGameRequest {
  nickname: string;
}

export interface JoinGameRequest {
  nickname: string;
}