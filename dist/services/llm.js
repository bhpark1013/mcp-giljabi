/**
 * Gemini Flash LLM 서비스
 * MCP 매칭을 위한 경량 LLM 사용
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
const MODEL_NAME = 'gemini-2.0-flash-lite';
let genAI = null;
function getClient() {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}
/**
 * LLM을 사용하여 사용자 쿼리에 맞는 MCP를 찾습니다
 */
export async function findMatchingMcps(query, mcps) {
    const client = getClient();
    const model = client.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            temperature: 0.1, // 일관된 결과를 위해 낮은 temperature
            maxOutputTokens: 1024,
        },
    });
    // MCP 목록을 간결하게 포맷팅
    const mcpList = mcps
        .map((mcp) => `[${mcp.id}] ${mcp.name}: ${mcp.description.slice(0, 150)}`)
        .join('\n');
    const prompt = `당신은 MCP(Model Context Protocol) 추천 전문가입니다.
사용자의 요청에 가장 적합한 MCP를 찾아주세요.

## 사용자 요청
"${query}"

## 사용 가능한 MCP 목록
${mcpList}

## 지시사항
1. 사용자 요청의 의도를 파악하세요
2. 요청에 적합한 MCP를 최대 5개까지 선택하세요
3. 적합한 MCP가 없으면 솔직히 "없음"이라고 답하세요
4. 아래 JSON 형식으로만 응답하세요

## 응답 형식 (JSON)
적합한 MCP가 있는 경우:
{
  "found": true,
  "matches": [
    {"id": 123, "name": "MCP이름", "reason": "선택 이유", "relevance": 85}
  ]
}

적합한 MCP가 없는 경우:
{
  "found": false,
  "reason": "해당 기능을 제공하는 MCP가 목록에 없습니다"
}

JSON 응답:`;
    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        // JSON 파싱 (마크다운 코드블록 제거)
        const jsonStr = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
        const parsed = JSON.parse(jsonStr);
        if (parsed.found === false) {
            return {
                success: true,
                matches: [],
                noMatchReason: parsed.reason,
            };
        }
        return {
            success: true,
            matches: parsed.matches || [],
        };
    }
    catch (error) {
        console.error('LLM 매칭 오류:', error);
        return {
            success: false,
            matches: [],
            noMatchReason: `LLM 처리 중 오류: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
/**
 * LLM 서비스 연결 확인
 */
export async function checkLlmService() {
    try {
        const client = getClient();
        const model = client.getGenerativeModel({ model: MODEL_NAME });
        await model.generateContent('test');
        return true;
    }
    catch (error) {
        console.error('Gemini Flash 연결 실패:', error);
        return false;
    }
}
//# sourceMappingURL=llm.js.map