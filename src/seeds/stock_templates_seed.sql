-- src/sql/stock_templates_seed.sql
INSERT INTO stock_templates (code, name, sector, description, volatility, difficulty, base_price, market_sensitivities, bull_events, bear_events) VALUES

-- 엔터테인먼트
('ENT-WORLD', '월드투어엔터', '엔터', '해외 투어·굿즈 비중이 큰 종합 엔터테인먼트', '보통', '보통', 45000,
 '{"rate":"0","fx":"+","commodity":"0"}',
 '[{"title":"월드투어 전석 매진","hint":"해외 매출 급증","lag":"다음 갱신","strength":"높음","type":"company"},{"title":"신인 그룹 데뷔 대성공","hint":"음원·굿즈 동반 상승","lag":"다음 갱신","strength":"중간","type":"company"},{"title":"대형 브랜드 글로벌 광고 계약","hint":"광고 매출 확대","lag":"다음 갱신","strength":"중간","type":"company"}]',
 '[{"title":"멤버 스캔들 이슈","hint":"행사 취소·브랜드 훼손","lag":"즉시","strength":"높음","type":"company"},{"title":"콘서트 일정 전면 연기","hint":"티켓 환불·매출 지연","lag":"즉시","strength":"중간","type":"company"},{"title":"OTT 계약 해지 루머","hint":"판권 수익 불확실성","lag":"다음 갱신","strength":"낮음","type":"rumor"}]'),

('ENT-DRAMA', '히트드라마스튜디오', '엔터', '드라마·영화 제작 중심 스튜디오', '보통', '보통', 38000,
 '{"rate":"0","fx":"+","commodity":"-"}',
 '[{"title":"신작 드라마 대흥행","hint":"광고·판권 가치 상승","lag":"다음 갱신","strength":"높음","type":"company"},{"title":"OTT 장기 독점 계약","hint":"안정적 현금흐름","lag":"2회 후","strength":"중간","type":"company"},{"title":"글로벌 공동제작 합의","hint":"해외 시장 진출","lag":"다음 갱신","strength":"중간","type":"company"}]',
 '[{"title":"개봉작 흥행 실패","hint":"손실충당 가능성","lag":"즉시","strength":"중간","type":"company"},{"title":"제작비 급등","hint":"마진 압박","lag":"다음 갱신","strength":"중간","type":"macro"},{"title":"IP 분쟁 소송","hint":"지연·비용 증가","lag":"2회 후","strength":"낮음","type":"company"}]'),

-- 전자
('ELEC-BIGCHIP', '빅칩전자', '전자', 'AI·서버용 반도체 수주 비중 확대', '높음', '보통', 85000,
 '{"rate":"-","fx":"+","commodity":"-"}',
 '[{"title":"대형 고객 AI칩 수주","hint":"장기 공급 계약","lag":"즉시","strength":"높음","type":"company"},{"title":"생산능력 증설 완료","hint":"매출 레버리지","lag":"2회 후","strength":"중간","type":"company"},{"title":"메모리가격 반등","hint":"판가 상승","lag":"다음 갱신","strength":"중간","type":"macro"}]',
 '[{"title":"산업 다운사이클 진입","hint":"수요 위축","lag":"다음 갱신","strength":"높음","type":"macro"},{"title":"주요 고객 이탈 루머","hint":"가동률 저하 우려","lag":"다음 갱신","strength":"중간","type":"rumor"},{"title":"공장 라인 장애","hint":"출하 지연","lag":"즉시","strength":"중간","type":"company"}]'),

('ELEC-FOLD', '폴더블디스플레이', '전자', '폴더블·고급 패널 중심의 디스플레이', '보통', '보통', 62000,
 '{"rate":"-","fx":"+","commodity":"-"}',
 '[{"title":"신제품 폴더블 채택 확대","hint":"납품량 증가","lag":"다음 갱신","strength":"중간","type":"company"},{"title":"장기 공급계약 체결","hint":"가동률 안정","lag":"2회 후","strength":"중간","type":"company"},{"title":"패널 단가 인상","hint":"수익성 개선","lag":"다음 갱신","strength":"중간","type":"company"}]',
 '[{"title":"판가 하락 압력","hint":"ASP 하락","lag":"다음 갱신","strength":"중간","type":"macro"},{"title":"주요 세트 기기 판매 부진","hint":"패널 수요 둔화","lag":"즉시","strength":"중간","type":"company"},{"title":"특허 분쟁 루머","hint":"소송 비용 우려","lag":"2회 후","strength":"낮음","type":"rumor"}]'),

-- 바이오
('BIO-TRIAL', '임상성공바이오', '바이오', '후기 임상 단계 파이프라인 보유', '높음', '어려움', 95000,
 '{"rate":"-","fx":"+","commodity":"0"}',
 '[{"title":"임상 3상 성공","hint":"허가 가능성↑","lag":"즉시","strength":"높음","type":"company"},{"title":"기술이전 계약 체결","hint":"대규모 마일스톤","lag":"즉시","strength":"높음","type":"company"},{"title":"패스트트랙 지정","hint":"심사 기간 단축","lag":"다음 갱신","strength":"중간","type":"policy"}]',
 '[{"title":"임상 중단(hold)","hint":"안전성 이슈","lag":"즉시","strength":"높음","type":"company"},{"title":"경쟁약 승인","hint":"시장 선점 실패","lag":"즉시","strength":"중간","type":"company"},{"title":"추가 자금조달 루머","hint":"희석 우려","lag":"다음 갱신","strength":"낮음","type":"rumor"}]'),

('BIO-DIAG', '진단수출바이오', '바이오', '진단키트·장비 수출 중심', '보통', '보통', 72000,
 '{"rate":"-","fx":"+","commodity":"0"}',
 '[{"title":"대형 수출 계약 체결","hint":"분기 실적 개선","lag":"즉시","strength":"중간","type":"company"},{"title":"신규 인증 획득","hint":"해외 판매 확대","lag":"다음 갱신","strength":"중간","type":"policy"},{"title":"제품 라인업 확장","hint":"고마진 제품 비중↑","lag":"2회 후","strength":"낮음","type":"company"}]',
 '[{"title":"수요 급감","hint":"재고 부담","lag":"다음 갱신","strength":"중간","type":"macro"},{"title":"단가 인하 압박","hint":"수익성 악화","lag":"다음 갱신","strength":"낮음","type":"company"},{"title":"경쟁 심화","hint":"가격 경쟁","lag":"다음 갱신","strength":"낮음","type":"company"}]'),

-- 통신
('TEL-PLAN', '요금개편통신', '통신', '요금제·가입자 지표에 민감한 통신', '낮음', '쉬움', 28000,
 '{"rate":"+","fx":"0","commodity":"0"}',
 '[{"title":"요금제 개편 흥행","hint":"가입자 순증·ARPU↑","lag":"2회 후","strength":"중간","type":"company"},{"title":"망 투자 비용 절감","hint":"감가상각 부담↓","lag":"2회 후","strength":"낮음","type":"company"},{"title":"정부 지원금 확대","hint":"가입 촉진","lag":"다음 갱신","strength":"낮음","type":"policy"}]',
 '[{"title":"요금 인하 압박","hint":"수익성 악화","lag":"다음 갱신","strength":"중간","type":"policy"},{"title":"네트워크 장애","hint":"보상·평판 악화","lag":"즉시","strength":"중간","type":"company"},{"title":"규제 강화 루머","hint":"요금 규제 우려","lag":"2회 후","strength":"낮음","type":"rumor"}]'),

('TEL-CLOUD', '대규모클라우드', '통신', '기업용 클라우드·데이터센터 사업', '보통', '보통', 54000,
 '{"rate":"-","fx":"+","commodity":"0"}',
 '[{"title":"대기업 전환 계약","hint":"MRR 확대","lag":"즉시","strength":"중간","type":"company"},{"title":"AI 워크로드 수요 급증","hint":"컴퓨팅 사용량↑","lag":"다음 갱신","strength":"중간","type":"macro"},{"title":"리전 증설 완료","hint":"수용능력↑","lag":"2회 후","strength":"중간","type":"company"}]',
 '[{"title":"대형 장애 발생","hint":"신뢰도 하락","lag":"즉시","strength":"높음","type":"company"},{"title":"가격 인하 경쟁","hint":"ARPU 하락","lag":"다음 갱신","strength":"중간","type":"company"},{"title":"해킹 시도 루머","hint":"보안 우려 확산","lag":"다음 갱신","strength":"낮음","type":"rumor"}]'),

-- 은행
('BANK-DIV', '고배당은행', '은행', '배당 성향이 높은 시중은행', '낮음', '쉬움', 32000,
 '{"rate":"++","fx":"0","commodity":"0"}',
 '[{"title":"기준금리 인상 시사","hint":"NIM 개선","lag":"다음 갱신","strength":"중간","type":"macro"},{"title":"배당 확대 발표","hint":"주주환원 강화","lag":"즉시","strength":"중간","type":"company"},{"title":"비이자이익 증가","hint":"수수료 수익↑","lag":"다음 갱신","strength":"낮음","type":"company"}]',
 '[{"title":"연체율 상승","hint":"건전성 우려","lag":"즉시","strength":"중간","type":"company"},{"title":"부동산 PF 부실 루머","hint":"충당금 확대 우려","lag":"다음 갱신","strength":"중간","type":"rumor"},{"title":"금리 인하","hint":"NIM 축소","lag":"다음 갱신","strength":"낮음","type":"macro"}]'),

('BANK-PAY', '결제확장페이', '은행', '가맹점·해외결제 확장 중인 핀테크', '보통', '보통', 67000,
 '{"rate":"-","fx":"0","commodity":"0"}',
 '[{"title":"대형 가맹점 제휴","hint":"거래액 증가","lag":"즉시","strength":"중간","type":"company"},{"title":"지갑 사용자 1천만 돌파","hint":"네트워크 효과","lag":"다음 갱신","strength":"중간","type":"company"},{"title":"규제 샌드박스 통과","hint":"신사업 테스트 허용","lag":"다음 갱신","strength":"낮음","type":"policy"}]',
 '[{"title":"수수료 규제","hint":"수익성 저하","lag":"다음 갱신","strength":"중간","type":"policy"},{"title":"보안 사고","hint":"보상 비용·신뢰 하락","lag":"즉시","strength":"중간","type":"company"},{"title":"마케팅비 급증","hint":"적자 확대","lag":"다음 갱신","strength":"낮음","type":"company"}]'),

-- 건설
('CNS-GLOBAL', '해외수주건설', '건설', '해외 플랜트·인프라 수주 중심', '보통', '보통', 41000,
 '{"rate":"-","fx":"+","commodity":"--"}',
 '[{"title":"중동 플랜트 대형 수주","hint":"수주잔고 증가","lag":"즉시","strength":"높음","type":"company"},{"title":"유가 상승","hint":"발주 확대","lag":"다음 갱신","strength":"중간","type":"macro"},{"title":"입찰 경쟁 승리","hint":"수익성 양호 조건","lag":"다음 갱신","strength":"중간","type":"company"}]',
 '[{"title":"원가 상승(철강·시멘트)","hint":"마진 압박","lag":"즉시","strength":"중간","type":"macro"},{"title":"정치 리스크 확대","hint":"현장 중단 우려","lag":"2회 후","strength":"중간","type":"macro"},{"title":"수주 취소 루머","hint":"잔고 감소 우려","lag":"다음 갱신","strength":"낮음","type":"rumor"}]'),

('CNS-HOUSING', '주택분양건설', '건설', '국내 주택 분양·리모델링 사업', '보통', '쉬움', 36000,
 '{"rate":"--","fx":"0","commodity":"-"}',
 '[{"title":"분양 완판","hint":"선수금 유입","lag":"즉시","strength":"중간","type":"company"},{"title":"정책 지원 확대","hint":"주택 수요 촉진","lag":"다음 갱신","strength":"중간","type":"policy"},{"title":"도시정비 사업 수주","hint":"장기 파이프라인","lag":"다음 갱신","strength":"중간","type":"company"}]',
 '[{"title":"미분양 증가","hint":"현금흐름 악화","lag":"다음 갱신","strength":"중간","type":"company"},{"title":"원자재 가격 급등","hint":"원가 상승","lag":"즉시","strength":"중간","type":"macro"},{"title":"금리 급등","hint":"수요 급랭","lag":"다음 갱신","strength":"중간","type":"macro"}]')

ON CONFLICT (code) DO NOTHING;