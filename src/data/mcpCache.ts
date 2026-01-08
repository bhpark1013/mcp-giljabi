/**
 * MCP 데이터 및 임베딩 캐시 관리
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { fetchAllMcps, McpInfo } from '../services/playmcpApi.js';
import { embed, embedBatch } from '../services/embedding.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CACHE_FILE = join(__dirname, 'embeddings.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

export interface McpWithEmbedding {
  id: number;
  name: string;
  description: string;
  developerName: string;
  monthlyCallCount: number;
  embedding: number[];
}

interface CacheData {
  timestamp: number;
  mcps: McpWithEmbedding[];
}

let cachedMcps: McpWithEmbedding[] | null = null;

/**
 * 캐시 파일에서 데이터를 로드합니다
 */
function loadFromCache(): McpWithEmbedding[] | null {
  try {
    if (!existsSync(CACHE_FILE)) {
      return null;
    }

    const data = readFileSync(CACHE_FILE, 'utf-8');
    const cache: CacheData = JSON.parse(data);

    // TTL 확인
    if (Date.now() - cache.timestamp > CACHE_TTL) {
      console.log('캐시가 만료되었습니다. 새로 생성합니다.');
      return null;
    }

    return cache.mcps;
  } catch (error) {
    console.error('캐시 로드 실패:', error);
    return null;
  }
}

/**
 * 데이터를 캐시 파일에 저장합니다
 */
function saveToCache(mcps: McpWithEmbedding[]): void {
  try {
    const cache: CacheData = {
      timestamp: Date.now(),
      mcps,
    };
    writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf-8');
    console.log(`캐시 저장 완료: ${mcps.length}개 MCP`);
  } catch (error) {
    console.error('캐시 저장 실패:', error);
  }
}

/**
 * MCP 텍스트를 임베딩용 문자열로 변환합니다
 */
function mcpToEmbeddingText(mcp: McpInfo): string {
  return `${mcp.name}. ${mcp.description || ''}`.trim();
}

/**
 * 모든 MCP의 임베딩을 생성합니다 (배치 처리)
 */
async function generateEmbeddings(mcps: McpInfo[]): Promise<McpWithEmbedding[]> {
  console.log(`${mcps.length}개 MCP의 임베딩을 생성합니다...`);

  // 텍스트 배열 준비
  const texts = mcps.map((mcp) => mcpToEmbeddingText(mcp));

  // 배치 크기 (OpenAI 제한 고려)
  const BATCH_SIZE = 50;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    console.log(`배치 처리 중: ${i + 1}-${Math.min(i + BATCH_SIZE, texts.length)}/${texts.length}`);

    try {
      const embeddings = await embedBatch(batch);
      allEmbeddings.push(...embeddings);
    } catch (error) {
      console.error(`배치 임베딩 실패:`, error);
      // 개별 처리로 폴백
      for (const text of batch) {
        try {
          const embedding = await embed(text);
          allEmbeddings.push(embedding);
        } catch (e) {
          console.error(`개별 임베딩 실패:`, e);
          allEmbeddings.push([]); // 빈 배열로 대체
        }
      }
    }
  }

  // 결과 조합
  const results: McpWithEmbedding[] = mcps.map((mcp, index) => ({
    id: mcp.id,
    name: mcp.name,
    description: mcp.description || '',
    developerName: mcp.developerName || '',
    monthlyCallCount: mcp.monthlyCallCount || 0,
    embedding: allEmbeddings[index] || [],
  }));

  return results.filter((mcp) => mcp.embedding.length > 0);
}

/**
 * MCP 데이터를 초기화합니다 (캐시 우선, 없으면 생성)
 */
export async function initMcpData(): Promise<McpWithEmbedding[]> {
  // 메모리 캐시 확인
  if (cachedMcps) {
    return cachedMcps;
  }

  // 파일 캐시 확인
  const fromCache = loadFromCache();
  if (fromCache) {
    console.log(`캐시에서 ${fromCache.length}개 MCP 로드 완료`);
    cachedMcps = fromCache;
    return fromCache;
  }

  // 새로 생성
  console.log('캐시가 없습니다. PlayMCP에서 데이터를 가져옵니다...');
  const mcps = await fetchAllMcps();
  console.log(`${mcps.length}개 MCP를 가져왔습니다.`);

  const mcpsWithEmbedding = await generateEmbeddings(mcps);
  saveToCache(mcpsWithEmbedding);

  cachedMcps = mcpsWithEmbedding;
  return mcpsWithEmbedding;
}

/**
 * 캐시된 MCP 데이터를 반환합니다
 */
export function getCachedMcps(): McpWithEmbedding[] | null {
  return cachedMcps;
}

/**
 * 캐시를 강제로 갱신합니다
 */
export async function refreshCache(): Promise<McpWithEmbedding[]> {
  cachedMcps = null;
  const mcps = await fetchAllMcps();
  const mcpsWithEmbedding = await generateEmbeddings(mcps);
  saveToCache(mcpsWithEmbedding);
  cachedMcps = mcpsWithEmbedding;
  return mcpsWithEmbedding;
}
