/**
 * MCP 데이터 캐시 관리
 * 임베딩 없이 MCP 메타데이터만 캐싱
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { fetchAllMcps } from '../services/playmcpApi.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CACHE_FILE = join(__dirname, 'mcpCache.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간
let cachedMcps = null;
/**
 * 캐시 파일에서 데이터를 로드합니다
 */
function loadFromCache() {
    try {
        if (!existsSync(CACHE_FILE)) {
            return null;
        }
        const data = readFileSync(CACHE_FILE, 'utf-8');
        const cache = JSON.parse(data);
        // TTL 확인
        if (Date.now() - cache.timestamp > CACHE_TTL) {
            console.log('캐시가 만료되었습니다. 새로 생성합니다.');
            return null;
        }
        return cache.mcps;
    }
    catch (error) {
        console.error('캐시 로드 실패:', error);
        return null;
    }
}
/**
 * 데이터를 캐시 파일에 저장합니다
 */
function saveToCache(mcps) {
    try {
        const cache = {
            timestamp: Date.now(),
            mcps,
        };
        writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf-8');
        console.log(`캐시 저장 완료: ${mcps.length}개 MCP`);
    }
    catch (error) {
        console.error('캐시 저장 실패:', error);
    }
}
/**
 * MCP 데이터를 초기화합니다 (캐시 우선, 없으면 API 호출)
 */
export async function initMcpData() {
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
    // 새로 가져오기
    console.log('캐시가 없습니다. PlayMCP에서 데이터를 가져옵니다...');
    const mcps = await fetchAllMcps();
    console.log(`${mcps.length}개 MCP를 가져왔습니다.`);
    const mcpData = mcps.map((mcp) => ({
        id: mcp.id,
        name: mcp.name,
        description: mcp.description || '',
        developerName: mcp.developerName || '',
        monthlyCallCount: mcp.monthlyCallCount || 0,
    }));
    saveToCache(mcpData);
    cachedMcps = mcpData;
    return mcpData;
}
/**
 * 캐시된 MCP 데이터를 반환합니다
 */
export function getCachedMcps() {
    return cachedMcps;
}
/**
 * 캐시를 강제로 갱신합니다
 */
export async function refreshCache() {
    cachedMcps = null;
    const mcps = await fetchAllMcps();
    const mcpData = mcps.map((mcp) => ({
        id: mcp.id,
        name: mcp.name,
        description: mcp.description || '',
        developerName: mcp.developerName || '',
        monthlyCallCount: mcp.monthlyCallCount || 0,
    }));
    saveToCache(mcpData);
    cachedMcps = mcpData;
    return mcpData;
}
//# sourceMappingURL=mcpCache.js.map