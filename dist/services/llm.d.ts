/**
 * Gemini Flash LLM 서비스
 * MCP 매칭을 위한 경량 LLM 사용
 */
export interface McpMatch {
    id: number;
    name: string;
    reason: string;
    relevance: number;
}
export interface LlmMatchResult {
    success: boolean;
    matches: McpMatch[];
    noMatchReason?: string;
}
interface McpForMatching {
    id: number;
    name: string;
    description: string;
}
/**
 * LLM을 사용하여 사용자 쿼리에 맞는 MCP를 찾습니다
 */
export declare function findMatchingMcps(query: string, mcps: McpForMatching[]): Promise<LlmMatchResult>;
/**
 * LLM 서비스 연결 확인
 */
export declare function checkLlmService(): Promise<boolean>;
export {};
//# sourceMappingURL=llm.d.ts.map