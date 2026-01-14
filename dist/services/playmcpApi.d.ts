/**
 * PlayMCP API 클라이언트
 * 카카오 PlayMCP에서 MCP 목록을 가져옵니다.
 */
export interface McpInfo {
    id: number;
    name: string;
    description: string;
    developerName: string;
    status: string;
    monthlyCallCount: number;
    totalCallCount: number;
    featuredLevel: number;
    tools?: McpTool[];
}
export interface McpTool {
    name: string;
    description: string;
}
/**
 * 모든 MCP 목록을 가져옵니다 (페이지네이션 처리)
 */
export declare function fetchAllMcps(): Promise<McpInfo[]>;
/**
 * 특정 MCP의 상세 정보를 가져옵니다
 */
export declare function fetchMcpDetail(mcpId: string): Promise<McpInfo | null>;
/**
 * MCP 페이지 URL 생성
 */
export declare function getMcpPageUrl(mcpId: string | number): string;
//# sourceMappingURL=playmcpApi.d.ts.map