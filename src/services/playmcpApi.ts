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

interface PlayMcpApiResponse {
  content: McpInfo[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const PLAYMCP_API_BASE = 'https://playmcp.kakao.com/api/v1';

/**
 * 모든 MCP 목록을 가져옵니다 (페이지네이션 처리)
 */
export async function fetchAllMcps(): Promise<McpInfo[]> {
  const allMcps: McpInfo[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const response = await fetch(
      `${PLAYMCP_API_BASE}/mcps?page=${page}&sortBy=FEATURED_LEVEL&pageSize=20`,
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`PlayMCP API error: ${response.status}`);
    }

    const data: PlayMcpApiResponse = await response.json();
    allMcps.push(...data.content);
    totalPages = data.totalPages;
    page++;
  }

  return allMcps;
}

/**
 * 특정 MCP의 상세 정보를 가져옵니다
 */
export async function fetchMcpDetail(mcpId: string): Promise<McpInfo | null> {
  try {
    const response = await fetch(
      `${PLAYMCP_API_BASE}/mcps/${mcpId}`,
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch MCP detail for ${mcpId}:`, error);
    return null;
  }
}

/**
 * MCP 페이지 URL 생성
 */
export function getMcpPageUrl(mcpId: string | number): string {
  return `https://playmcp.kakao.com/mcp/${mcpId}`;
}
