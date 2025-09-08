import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum Sector {
  ENTERTAINMENT = '엔터',
  ELECTRONICS = '전자',
  BIO = '바이오',
  TELECOM = '통신',
  BANKING = '은행',
  CONSTRUCTION = '건설'
}

export enum Volatility {
  LOW = '낮음',
  MEDIUM = '보통',
  HIGH = '높음'
}

export enum Difficulty {
  EASY = '쉬움',
  MEDIUM = '보통',
  HARD = '어려움'
}

export interface NewsEvent {
  title: string;
  hint: string;
  lag: string; // '즉시', '다음 갱신', '2회 후'
  strength: string; // '낮음', '중간', '높음'
  type: string; // 'company', 'macro', 'policy', 'rumor'
}

export interface MarketSensitivities {
  rate: string; // 금리 민감도: '++', '+', '0', '-', '--'
  fx: string; // 환율 민감도: '+', '0', '-'
  commodity: string; // 원자재 민감도: '+', '0', '-', '--'
}

@Entity({ name: 'stock_templates' })
export class StockTemplateEntity {
  @PrimaryColumn('varchar', { length: 20 })
  code!: string; // ENT-WORLD, ELEC-BIGCHIP 등

  @Column('varchar', { length: 100 })
  name!: string; // 회사명

  @Column('enum', { enum: Sector })
  sector!: Sector;

  @Column('text')
  description!: string; // 회사 설명

  @Column('enum', { enum: Volatility })
  volatility!: Volatility;

  @Column('enum', { enum: Difficulty })
  difficulty!: Difficulty;

  @Column('jsonb', { name: 'market_sensitivities' })
  marketSensitivities!: MarketSensitivities;

  @Column('jsonb', { name: 'bull_events' })
  bullEvents!: NewsEvent[]; // 호재 뉴스들

  @Column('jsonb', { name: 'bear_events' })
  bearEvents!: NewsEvent[]; // 악재 뉴스들

  @Column('decimal', { name: 'base_price', precision: 12, scale: 2, default: 50000 })
  basePrice!: number; // 기준 가격

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
