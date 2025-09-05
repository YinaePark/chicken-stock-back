export interface Game {
  id: string;
  status: 'WAITING' | 'STARTED' | 'ENDED';
  players: Player[];
  maxPlayers: number;
  currentRound: number;
  totalRounds: number;
  createdAt: Date;
  startTime?: Date;
  endTime?: Date;
}

export interface Player {
  id: string;
  gameId: string;
  nickname: string;
  cash: number;
  portfolio: { [companyCode: string]: number };
  totalValue: number;
  isConnected: boolean;
  joinedAt: Date;
}