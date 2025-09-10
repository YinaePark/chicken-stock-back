export interface TradeRequest {
  playerId: string;
  stockCode: string;
  type: 'BUY' | 'SELL';
  quantity: number;
}

export interface PortfolioData {
  cash: number;
  totalAssetValue: number;
  profitLoss: number;
  profitRate: number;
  holdings: Array<{
    stockCode: string;
    stockName: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    currentValue: number;
    profitLoss: number;
    profitRate: number;
  }>;
}