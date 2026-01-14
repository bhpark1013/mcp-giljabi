/**
 * MCP 데이터 캐시 관리
 * 임베딩 없이 MCP 메타데이터만 캐싱
 */
export interface McpData {
    id: number;
    name: string;
    description: string;
    developerName: string;
    monthlyCallCount: number;
}
/**
 * MCP 데이터를 초기화합니다 (캐시 우선, 없으면 API 호출)
 */
export declare function initMcpData(): Promise<McpData[]>;
/**
 * 캐시된 MCP 데이터를 반환합니다
 */
export declare function getCachedMcps(): McpData[] | null;
/**
 * 캐시를 강제로 갱신합니다
 */
export declare function refreshCache(): Promise<McpData[]>;
//# sourceMappingURL=mcpCache.d.ts.map