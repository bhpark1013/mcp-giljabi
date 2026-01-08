/**
 * find_mcp 도구
 * 사용자 요청에 맞는 MCP를 하이브리드 검색으로 찾습니다
 * (키워드 매칭 + 시맨틱 검색)
 */

import { embed } from '../services/embedding.js';
import { getCachedMcps, McpWithEmbedding } from '../data/mcpCache.js';
import { cosineSimilarity } from '../utils/similarity.js';
import { getMcpPageUrl } from '../services/playmcpApi.js';
import {
  extractKeywords,
  matchMcpKeywords,
  calculateKeywordScore,
  calculateHybridScore,
} from '../utils/matcher.js';

export interface McpRecommendation {
  id: number;
  name: string;
  description: string;
  developerName: string;
  monthlyCallCount: number;
  similarity: number;
  url: string;
}

export interface FindMcpResult {
  success: boolean;
  query: string;
  recommendations: McpRecommendation[];
  totalFound: number;
  message: string;
}

const SIMILARITY_THRESHOLD = 0.3; // 최소 유사도 임계값
const TOP_K = 5; // 최대 추천 개수

/**
 * 사용자 요청에 맞는 MCP를 찾습니다
 */
export async function findMcp(query: string): Promise<FindMcpResult> {
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
    // 쿼리에서 키워드 추출
    const queryKeywords = extractKeywords(query);

    // 쿼리 임베딩 생성
    const queryEmbedding = await embed(query);

    // 각 MCP와의 하이브리드 점수 계산
    const withSimilarity = mcps.map((mcp) => {
      // 임베딩 유사도
      const embeddingScore = cosineSimilarity(queryEmbedding, mcp.embedding);

      // 키워드 유사도
      const mcpKeywords = matchMcpKeywords(mcp.name, mcp.description);
      const keywordScore = calculateKeywordScore(queryKeywords, mcpKeywords);

      // 하이브리드 점수 (키워드 60% + 임베딩 40%)
      const hybridScore = calculateHybridScore(keywordScore, embeddingScore, 0.6);

      // 키워드 매칭이 있으면 최소 점수 보장 (부스팅)
      const finalScore = keywordScore > 0 ? Math.max(hybridScore, 0.4) : hybridScore;

      return {
        ...mcp,
        similarity: finalScore,
        keywordScore,
        embeddingScore,
      };
    });

    // 유사도 임계값 이상인 것만 필터링하고 정렬
    const filtered = withSimilarity
      .filter((mcp) => mcp.similarity >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, TOP_K);

    // 결과 포맷팅
    const recommendations: McpRecommendation[] = filtered.map((mcp) => ({
      id: mcp.id,
      name: mcp.name,
      description: mcp.description,
      developerName: mcp.developerName,
      monthlyCallCount: mcp.monthlyCallCount,
      similarity: Math.round(mcp.similarity * 100) / 100,
      url: getMcpPageUrl(mcp.id),
    }));

    if (recommendations.length === 0) {
      return {
        success: true,
        query,
        recommendations: [],
        totalFound: 0,
        message: `"${query}"에 해당하는 MCP를 찾지 못했습니다. 다른 키워드로 검색해보세요.`,
      };
    }

    return {
      success: true,
      query,
      recommendations,
      totalFound: recommendations.length,
      message: `"${query}"에 관련된 ${recommendations.length}개의 MCP를 찾았습니다.`,
    };
  } catch (error) {
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
export function formatFindMcpResult(result: FindMcpResult): string {
  if (!result.success) {
    return `오류: ${result.message}`;
  }

  if (result.recommendations.length === 0) {
    return result.message;
  }

  let output = `🔍 "${result.query}" 검색 결과 (${result.totalFound}개)\n\n`;

  result.recommendations.forEach((mcp, index) => {
    output += `${index + 1}. **${mcp.name}**\n`;
    output += `   📝 ${mcp.description}\n`;
    output += `   👤 개발자: ${mcp.developerName}\n`;
    output += `   📊 월간 호출: ${mcp.monthlyCallCount}회\n`;
    output += `   🔗 ${mcp.url}\n`;
    output += `   📈 관련도: ${Math.round(mcp.similarity * 100)}%\n\n`;
  });

  output += `💡 원하는 MCP를 추가하려면 add_mcp 도구를 사용하세요.`;

  return output;
}
