/**
 * find_mcp 도구
 * LLM을 사용하여 사용자 요청에 맞는 MCP를 찾습니다
 */
export interface McpRecommendation {
    id: number;
    name: string;
    description: string;
    developerName: string;
    monthlyCallCount: number;
    relevance: number;
    reason: string;
    url: string;
}
export interface FindMcpResult {
    success: boolean;
    query: string;
    recommendations: McpRecommendation[];
    totalFound: number;
    message: string;
    noMatchReason?: string;
}
/**
 * 사용자 요청에 맞는 MCP를 찾습니다
 */
export declare function findMcp(query: string): Promise<FindMcpResult>;
/**
 * 결과를 보기 좋게 포맷팅합니다
 */
export declare function formatFindMcpResult(result: FindMcpResult): string;
//# sourceMappingURL=findMcp.d.ts.map