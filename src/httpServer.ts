/**
 * HTTP/SSE 서버
 * PlayMCP 등록을 위한 HTTP 엔드포인트 제공
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { initMcpData, getCachedMcps } from './data/mcpCache.js';
import { findMcp, formatFindMcpResult } from './tools/findMcp.js';
import { addMcp, formatAddMcpResult } from './tools/addMcp.js';
import { checkLlmService } from './services/llm.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Note: express.json()은 특정 경로에만 적용 (SSE message는 raw body 필요)

// Store active transports
const transports: Map<string, SSEServerTransport> = new Map();

/**
 * MCP 서버 인스턴스 생성
 */
function createMcpServer(): Server {
  const server = new Server(
    {
      name: 'mcp-giljabi',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 사용 가능한 도구 목록
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'find_mcp',
          description:
            '사용자의 요청이나 필요한 기능에 맞는 MCP를 찾아줍니다. PlayMCP에 등록된 MCP들 중에서 AI가 직접 분석하여 가장 적합한 MCP를 추천합니다. 적합한 MCP가 없으면 없다고 알려줍니다.',
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
          description:
            '특정 MCP를 추가하는 방법을 안내합니다. MCP ID를 입력하면 해당 MCP의 설치 링크와 설치 방법을 제공합니다.',
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

  // 도구 실행 핸들러
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'find_mcp': {
        const query = (args as { query: string }).query;
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
        const mcpId = (args as { mcpId: string }).mcpId;
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

  return server;
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  const mcps = getCachedMcps();
  res.json({
    status: 'ok',
    service: 'mcp-giljabi',
    mcpCount: mcps?.length || 0,
    activeSessions: transports.size,
    sessionIds: Array.from(transports.keys()),
    timestamp: new Date().toISOString(),
  });
});

// SSE endpoint for MCP communication
app.get('/sse', async (req: Request, res: Response) => {
  console.log('SSE 연결 요청');

  const transport = new SSEServerTransport('/message', res);
  // SSEServerTransport의 내부 sessionId 사용
  const sessionId = transport.sessionId;
  transports.set(sessionId, transport);
  console.log('세션 ID:', sessionId);

  const server = createMcpServer();

  // Handle client disconnect
  req.on('close', () => {
    console.log('SSE 연결 종료:', sessionId);
    transports.delete(sessionId);
  });

  try {
    await server.connect(transport);
    console.log('MCP 서버 연결 완료:', sessionId);
  } catch (error) {
    console.error('MCP 서버 연결 실패:', error);
    transports.delete(sessionId);
  }
});

// Message endpoint for SSE transport
app.post('/message', async (req: Request, res: Response) => {
  // SSEServerTransport handles routing internally
  // This endpoint receives messages and routes them to the correct transport
  const sessionId = req.query.sessionId as string;
  console.log('메시지 수신 - sessionId:', sessionId);
  console.log('활성 세션:', Array.from(transports.keys()));
  const transport = transports.get(sessionId);

  if (transport) {
    // The transport handles the message internally
    console.log('세션 찾음, 메시지 처리 중...');
    await transport.handlePostMessage(req, res);
  } else {
    console.log('세션 찾기 실패!');
    res.status(404).json({ error: 'Session not found' });
  }
});

// REST API endpoints (alternative to SSE for simple testing)
app.post('/api/find-mcp', express.json(), async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: 'query is required' });
      return;
    }
    const result = await findMcp(query);
    res.json(result);
  } catch (error) {
    console.error('find-mcp 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/add-mcp', express.json(), async (req: Request, res: Response) => {
  try {
    const { mcpId } = req.body;
    if (!mcpId) {
      res.status(400).json({ error: 'mcpId is required' });
      return;
    }
    const result = await addMcp(mcpId);
    res.json(result);
  } catch (error) {
    console.error('add-mcp 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// MCP info endpoint (for PlayMCP registration verification)
app.get('/mcp/info', (_req: Request, res: Response) => {
  res.json({
    name: 'mcp-giljabi',
    version: '1.0.0',
    description: 'PlayMCP에서 원하는 MCP를 찾아주는 길잡이 서비스',
    tools: [
      {
        name: 'find_mcp',
        description: '사용자의 요청에 맞는 MCP를 AI가 분석하여 추천합니다.',
      },
      {
        name: 'add_mcp',
        description: 'MCP 설치 방법을 안내합니다.',
      },
    ],
  });
});

/**
 * HTTP 서버 시작
 */
async function startHttpServer(): Promise<void> {
  console.log('🚀 MCP 길잡이 HTTP 서버를 시작합니다...');

  // Gemini API 연결 확인
  console.log('🔍 Gemini API 연결 확인 중...');
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const llmReady = await checkLlmService();
  if (!llmReady) {
    console.error('❌ Gemini Flash API 연결 실패');
    process.exit(1);
  }
  console.log('✅ Gemini Flash API 연결 성공');

  // MCP 데이터 초기화
  console.log('📚 MCP 데이터 초기화 중...');
  const mcps = await initMcpData();
  console.log(`✅ ${mcps.length}개 MCP 데이터 로드 완료`);

  // 서버 시작
  app.listen(PORT, () => {
    console.log(`✅ HTTP 서버가 포트 ${PORT}에서 시작되었습니다!`);
    console.log(`   - Health: http://localhost:${PORT}/health`);
    console.log(`   - SSE: http://localhost:${PORT}/sse`);
    console.log(`   - API: http://localhost:${PORT}/api/find-mcp`);
  });
}

// 직접 실행 시 서버 시작
startHttpServer().catch((error) => {
  console.error('서버 시작 오류:', error);
  process.exit(1);
});
