#!/usr/bin/env tsx

/**
 * 검색 기능 테스트 스크립트
 */

import { initMcpData } from '../data/mcpCache.js';
import { findMcp, formatFindMcpResult } from '../tools/findMcp.js';
import { addMcp, formatAddMcpResult } from '../tools/addMcp.js';
import { checkEmbeddingService } from '../services/embedding.js';

const TEST_QUERIES = [
  '영화 정보 검색',
  '맛집 추천',
  '날씨 알려줘',
  '음악 추천',
  '배고파',
  '학교 급식',
  '택배 배송',
  '지하철 도착',
];

async function main() {
  console.log('🧪 MCP 길잡이 검색 테스트\n');

  // OpenAI API 연결 확인
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const embeddingReady = await checkEmbeddingService();
  if (!embeddingReady) {
    console.error('❌ OpenAI API 연결 실패');
    process.exit(1);
  }
  console.log('✅ OpenAI API 연결 성공\n');

  // 데이터 초기화
  console.log('📚 MCP 데이터 로드 중...\n');
  await initMcpData();

  // 테스트 쿼리 실행
  console.log('=' .repeat(60));
  console.log('검색 테스트 시작');
  console.log('=' .repeat(60));

  for (const query of TEST_QUERIES) {
    console.log(`\n🔍 쿼리: "${query}"`);
    console.log('-'.repeat(40));

    const result = await findMcp(query);
    console.log(formatFindMcpResult(result));
    console.log();
  }

  // add_mcp 테스트
  console.log('=' .repeat(60));
  console.log('add_mcp 테스트');
  console.log('=' .repeat(60));

  const addResult = await addMcp('61');
  console.log(formatAddMcpResult(addResult));

  console.log('\n✅ 테스트 완료!');
}

main().catch((error) => {
  console.error('오류:', error);
  process.exit(1);
});
