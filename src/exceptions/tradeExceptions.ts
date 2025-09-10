export class TradeException extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TradeException';
  }
}

export class InsufficientFundsException extends TradeException {
  constructor(required: number, available: number) {
    super(
      `잔고가 부족합니다. 필요: ${required.toLocaleString()}원, 보유: ${available.toLocaleString()}원`,
      'INSUFFICIENT_FUNDS'
    );
  }
}

export class InsufficientStockException extends TradeException {
  constructor(required: number, available: number) {
    super(
      `보유 주식이 부족합니다. 필요: ${required}주, 보유: ${available}주`,
      'INSUFFICIENT_STOCK'
    );
  }
}

export class PlayerNotFoundException extends TradeException {
  constructor() {
    super('플레이어를 찾을 수 없습니다.', 'PLAYER_NOT_FOUND');
  }
}

export class StockNotFoundException extends TradeException {
  constructor() {
    super('해당 종목을 찾을 수 없습니다.', 'STOCK_NOT_FOUND');
  }
}

export class InvalidQuantityException extends TradeException {
  constructor() {
    super('거래 수량은 0보다 커야 합니다.', 'INVALID_QUANTITY');
  }
}