/**
 * 하이브리드 매칭 로직
 * 키워드 매칭 + 시맨틱 검색을 조합하여 정확도를 높입니다
 */
/**
 * 텍스트에서 키워드를 추출합니다
 */
export declare function extractKeywords(text: string): string[];
/**
 * MCP 이름/설명에서 매칭되는 키워드를 찾습니다
 */
export declare function matchMcpKeywords(mcpName: string, mcpDescription: string): string[];
/**
 * 키워드 기반 점수를 계산합니다
 */
export declare function calculateKeywordScore(queryKeywords: string[], mcpKeywords: string[]): number;
/**
 * 하이브리드 점수를 계산합니다 (키워드 50% + 임베딩 50%)
 */
export declare function calculateHybridScore(keywordScore: number, embeddingScore: number, keywordWeight?: number): number;
//# sourceMappingURL=matcher.d.ts.map