/**
 * add_mcp 도구
 * MCP 설치 링크 및 안내를 제공합니다
 */

import { getCachedMcps, McpData } from '../data/mcpCache.js';
import { getMcpPageUrl, fetchMcpDetail } from '../services/playmcpApi.js';

export interface AddMcpResult {
  success: boolean;
  mcpId: string;
  mcpName: string | null;
  url: string;
  instructions: string[];
  message: string;
}

/**
 * MCP ID로 캐시에서 MCP 정보를 찾습니다
 */
function findMcpById(mcpId: string): McpData | undefined {
  const mcps = getCachedMcps();
  if (!mcps) return undefined;

  const id = parseInt(mcpId, 10);
  return mcps.find((mcp) => mcp.id === id);
}

/**
 * MCP 추가 안내를 제공합니다
 */
export async function addMcp(mcpId: string): Promise<AddMcpResult> {
  const url = getMcpPageUrl(mcpId);

  // 캐시에서 먼저 찾기
  let mcpInfo = findMcpById(mcpId);

  // 캐시에 없으면 API에서 가져오기
  if (!mcpInfo) {
    const detail = await fetchMcpDetail(mcpId);
    if (detail) {
      mcpInfo = {
        id: detail.id,
        name: detail.name,
        description: detail.description || '',
        developerName: detail.developerName || '',
        monthlyCallCount: detail.monthlyCallCount || 0,
      };
    }
  }

  const mcpName = mcpInfo?.name || `MCP #${mcpId}`;

  const instructions = [
    `1. 아래 링크에 접속하세요:`,
    `   ${url}`,
    ``,
    `2. 카카오 계정으로 로그인하세요.`,
    ``,
    `3. '추가하기' 버튼을 클릭하세요.`,
    ``,
    `4. Claude Desktop 설정에서 MCP를 활성화하세요.`,
    ``,
    `5. Claude Desktop을 재시작하면 "${mcpName}"을(를) 사용할 수 있습니다!`,
  ];

  return {
    success: true,
    mcpId,
    mcpName,
    url,
    instructions,
    message: `"${mcpName}" MCP를 추가하는 방법입니다.`,
  };
}

/**
 * 결과를 보기 좋게 포맷팅합니다
 */
export function formatAddMcpResult(result: AddMcpResult): string {
  if (!result.success) {
    return `오류: ${result.message}`;
  }

  let output = `🚀 **${result.mcpName}** 추가하기\n\n`;
  output += `📎 링크: ${result.url}\n\n`;
  output += `📋 **설치 방법:**\n\n`;
  output += result.instructions.join('\n');
  output += `\n\n✅ 설치 후 이 MCP의 기능을 바로 사용할 수 있습니다!`;

  return output;
}
