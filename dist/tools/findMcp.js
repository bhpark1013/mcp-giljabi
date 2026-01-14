/**
 * find_mcp 도구
 * LLM을 사용하여 사용자 요청에 맞는 MCP를 찾습니다
 */
import { getCachedMcps } from '../data/mcpCache.js';
import { findMatchingMcps } from '../services/llm.js';
import { getMcpPageUrl } from '../services/playmcpApi.js';
/**
 * 사용자 요청에 맞는 MCP를 찾습니다
 */
export async function findMcp(query) {
    const mcps = getCachedMcps();
    if (!mcps || mcps.length === 0) {
        return {
            success: false,
            query,
            recommendations: [],
            totalFound: 0,
            message: 'MCP 데이터가 초기화되지 않았습니다. 서버를 재시작해주세요.',
        };
    }
    try {
        // LLM을 사용하여 매칭
        const llmResult = await findMatchingMcps(query, mcps);
        if (!llmResult.success) {
            return {
                success: false,
                query,
                recommendations: [],
                totalFound: 0,
                message: llmResult.noMatchReason || 'LLM 처리 중 오류가 발생했습니다.',
            };
        }
        // 매칭된 MCP가 없는 경우
        if (llmResult.matches.length === 0) {
            return {
                success: true,
                query,
                recommendations: [],
                totalFound: 0,
                message: `"${query}"에 해당하는 MCP를 찾지 못했습니다.`,
                noMatchReason: llmResult.noMatchReason,
            };
        }
        // MCP 상세 정보와 결합 (ID 타입 불일치 처리: 캐시는 문자열, LLM은 숫자)
        const recommendations = llmResult.matches
            .map((match) => {
            const mcpData = mcps.find((m) => String(m.id) === String(match.id));
            if (!mcpData)
                return null;
            return {
                id: mcpData.id,
                name: mcpData.name,
                description: mcpData.description,
                developerName: mcpData.developerName,
                monthlyCallCount: mcpData.monthlyCallCount,
                relevance: match.relevance,
                reason: match.reason,
                url: getMcpPageUrl(mcpData.id),
            };
        })
            .filter((r) => r !== null);
        return {
            success: true,
            query,
            recommendations,
            totalFound: recommendations.length,
            message: `"${query}"에 관련된 ${recommendations.length}개의 MCP를 찾았습니다.`,
        };
    }
    catch (error) {
        return {
            success: false,
            query,
            recommendations: [],
            totalFound: 0,
            message: `검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
/**
 * 결과를 보기 좋게 포맷팅합니다
 */
export function formatFindMcpResult(result) {
    if (!result.success) {
        return `오류: ${result.message}`;
    }
    if (result.recommendations.length === 0) {
        let output = `🔍 "${result.query}" 검색 결과\n\n`;
        output += `❌ 적합한 MCP를 찾지 못했습니다.\n`;
        if (result.noMatchReason) {
            output += `\n💬 ${result.noMatchReason}`;
        }
        return output;
    }
    let output = `🔍 "${result.query}" 검색 결과 (${result.totalFound}개)\n\n`;
    result.recommendations.forEach((mcp, index) => {
        output += `${index + 1}. **${mcp.name}**\n`;
        output += `   📝 ${mcp.description.slice(0, 150)}${mcp.description.length > 150 ? '...' : ''}\n`;
        output += `   💡 ${mcp.reason}\n`;
        output += `   👤 개발자: ${mcp.developerName}\n`;
        output += `   📊 월간 호출: ${mcp.monthlyCallCount}회\n`;
        output += `   🔗 ${mcp.url}\n`;
        output += `   📈 관련도: ${mcp.relevance}%\n\n`;
    });
    output += `💡 원하는 MCP를 추가하려면 add_mcp 도구를 사용하세요.`;
    return output;
}
//# sourceMappingURL=findMcp.js.map