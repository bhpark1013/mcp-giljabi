#!/usr/bin/env tsx
/**
 * 임베딩 사전 준비 스크립트
 * 서버 시작 전에 MCP 데이터와 임베딩을 미리 생성합니다.
 */
import { checkEmbeddingService } from '../services/embedding.js';
import { initMcpData } from '../data/mcpCache.js';
async function main() {
    console.log('🚀 MCP 임베딩 준비를 시작합니다...\n');
    // Gemini API 연결 확인
    console.log('1️⃣ Gemini API 연결 확인 중...');
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
        process.exit(1);
    }
    const embeddingReady = await checkEmbeddingService();
    if (!embeddingReady) {
        console.error('❌ Gemini API 연결 실패');
        process.exit(1);
    }
    console.log('   ✅ Gemini API 연결 성공\n');
    // MCP 데이터 및 임베딩 초기화
    console.log('2️⃣ MCP 데이터 및 임베딩 생성 중...');
    console.log('   (처음 실행 시 몇 초 소요됩니다)\n');
    const startTime = Date.now();
    const mcps = await initMcpData();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ 완료! ${mcps.length}개 MCP 임베딩 생성 (${elapsed}초 소요)`);
    console.log('   캐시 파일: src/data/embeddings.json');
    console.log('\n이제 서버를 시작할 수 있습니다: npm start');
}
main().catch((error) => {
    console.error('오류:', error);
    process.exit(1);
});
//# sourceMappingURL=prepareEmbeddings.js.map