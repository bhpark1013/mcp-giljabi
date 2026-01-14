/**
 * add_mcp 도구
 * MCP 설치 링크 및 안내를 제공합니다
 */
export interface AddMcpResult {
    success: boolean;
    mcpId: string;
    mcpName: string | null;
    url: string;
    instructions: string[];
    message: string;
}
/**
 * MCP 추가 안내를 제공합니다
 */
export declare function addMcp(mcpId: string): Promise<AddMcpResult>;
/**
 * 결과를 보기 좋게 포맷팅합니다
 */
export declare function formatAddMcpResult(result: AddMcpResult): string;
//# sourceMappingURL=addMcp.d.ts.map