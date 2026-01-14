#!/usr/bin/env node
/**
 * MCP 길잡이 (mcp-giljabi)
 *
 * PlayMCP에서 사용자 요청에 적합한 MCP를 찾아주는 서비스입니다.
 * 시맨틱 검색을 통해 관련 MCP를 추천하고, 설치 방법을 안내합니다.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { initMcpData } from './data/mcpCache.js';
import { findMcp, formatFindMcpResult } from './tools/findMcp.js';
import { addMcp, formatAddMcpResult } from './tools/addMcp.js';
import { checkLlmService } from './services/llm.js';
const server = new Server({
    name: 'mcp-giljabi',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
/**
 * 사용 가능한 도구 목록
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'find_mcp',
                description: '사용자의 요청이나 필요한 기능에 맞는 MCP를 찾아줍니다. PlayMCP에 등록된 MCP들 중에서 AI가 직접 분석하여 가장 적합한 MCP를 추천합니다. 적합한 MCP가 없으면 없다고 알려줍니다. 예: "영화 정보", "맛집 검색", "날씨", "음악 추천" 등',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: '찾고자 하는 기능이나 요청을 설명하는 텍스트',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'add_mcp',
                description: '특정 MCP를 추가하는 방법을 안내합니다. MCP ID를 입력하면 해당 MCP의 설치 링크와 설치 방법을 제공합니다.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        mcpId: {
                            type: 'string',
                            description: '추가하려는 MCP의 ID',
                        },
                    },
                    required: ['mcpId'],
                },
            },
        ],
    };
});
/**
 * 도구 실행 핸들러
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    switch (name) {
        case 'find_mcp': {
            const query = args.query;
            const result = await findMcp(query);
            return {
                content: [
                    {
                        type: 'text',
                        text: formatFindMcpResult(result),
                    },
                ],
            };
        }
        case 'add_mcp': {
            const mcpId = args.mcpId;
            const result = await addMcp(mcpId);
            return {
                content: [
                    {
                        type: 'text',
                        text: formatAddMcpResult(result),
                    },
                ],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});
/**
 * 서버 시작
 */
async function main() {
    console.error('🚀 MCP 길잡이 서버를 시작합니다...');
    // Gemini API 연결 확인
    console.error('🔍 Gemini API 연결 확인 중...');
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
        process.exit(1);
    }
    const llmReady = await checkLlmService();
    if (!llmReady) {
        console.error('❌ Gemini Flash API 연결 실패');
        process.exit(1);
    }
    console.error('✅ Gemini Flash API 연결 성공');
    // MCP 데이터 초기화
    console.error('📚 MCP 데이터 초기화 중...');
    try {
        const mcps = await initMcpData();
        console.error(`✅ ${mcps.length}개 MCP 데이터 로드 완료`);
    }
    catch (error) {
        console.error('❌ MCP 데이터 초기화 실패:', error);
        process.exit(1);
    }
    // MCP 서버 시작
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('✅ MCP 길잡이 서버가 시작되었습니다!');
}
main().catch((error) => {
    console.error('서버 오류:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map