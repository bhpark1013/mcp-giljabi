#!/usr/bin/env tsx
/**
 * 검색 기능 테스트 스크립트
 */
import { initMcpData } from '../data/mcpCache.js';
import { findMcp, formatFindMcpResult } from '../tools/findMcp.js';
import { addMcp, formatAddMcpResult } from '../tools/addMcp.js';
import { checkLlmService } from '../services/llm.js';
const TEST_QUERIES = [
    '영화 정보 검색',
    '맛집 추천',
    '날씨 알려줘',
    '음악 추천',
    '배고파',
    '학교 급식',
    '택배 배송',
    '지하철 도착',
    '주식 정보', // 없을 수 있는 케이스
];
async function main() {
    console.log('🧪 MCP 길잡이 검색 테스트 (LLM 기반)\n');
    // Gemini API 연결 확인
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
        process.exit(1);
    }
    const llmReady = await checkLlmService();
    if (!llmReady) {
        console.error('❌ Gemini Flash API 연결 실패');
        process.exit(1);
    }
    console.log('✅ Gemini Flash API 연결 성공\n');
    // 데이터 초기화
    console.log('📚 MCP 데이터 로드 중...\n');
    await initMcpData();
    // 테스트 쿼리 실행
    console.log('='.repeat(60));
    console.log('검색 테스트 시작');
    console.log('='.repeat(60));
    for (const query of TEST_QUERIES) {
        console.log(`\n🔍 쿼리: "${query}"`);
        console.log('-'.repeat(40));
        const result = await findMcp(query);
        console.log(formatFindMcpResult(result));
        console.log();
        // Rate limit 방지
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    // add_mcp 테스트
    console.log('='.repeat(60));
    console.log('add_mcp 테스트');
    console.log('='.repeat(60));
    const addResult = await addMcp('61');
    console.log(formatAddMcpResult(addResult));
    console.log('\n✅ 테스트 완료!');
}
main().catch((error) => {
    console.error('오류:', error);
    process.exit(1);
});
//# sourceMappingURL=testSearch.js.map