# MCP 길잡이 (mcp-giljabi)

사용자의 요청에 맞는 PlayMCP를 찾아주는 MCP 서버입니다.

## 기능

- **find_mcp**: AI가 직접 분석하여 적합한 MCP를 추천합니다. 적합한 MCP가 없으면 "없다"고 알려줍니다.
- **add_mcp**: MCP 설치 방법을 안내합니다

## 동작 방식

```
사용자: "영화 정보 검색해줘"
         ↓
   Gemini 2.0 Flash가 MCP 목록 분석
         ↓
적합한 MCP 추천 + 선택 이유 설명
```

**장점:**
- 의도 파악이 정확함 ("심심해" → 게임/영화 추천)
- 없는 기능은 "없다"고 명확히 답변 ("주식 정보" → 해당 MCP 없음)
- 임베딩 계산/캐싱 불필요

## 사전 요구사항

1. **Node.js** (v18 이상)
2. **Google Gemini API Key** (무료)

## 설치

```bash
cd mcp-giljabi
npm install
```

## 환경 변수 설정

```bash
cp .env.example .env
# .env 파일에 GEMINI_API_KEY 설정
```

Gemini API Key 발급: https://aistudio.google.com/app/apikey

## 빌드

```bash
npm run build
```

## 실행

```bash
npm start
```

## 로컬 테스트 방법

### 1. 검색 기능 테스트

```bash
GEMINI_API_KEY=your-api-key npm run test-search
```

### 2. MCP Inspector로 테스트

```bash
npm run build
GEMINI_API_KEY=your-api-key npm run inspector
# http://localhost:5173 접속
```

### 3. Claude Desktop에서 로컬 테스트

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-giljabi": {
      "command": "node",
      "args": ["/path/to/mcp-giljabi/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 사용 예시

### find_mcp - 결과 있음

```
입력: "영화 정보를 검색하고 싶어"

출력:
🔍 "영화 정보를 검색하고 싶어" 검색 결과 (3개)

1. **Movie Digging**
   📝 TMDb API를 활용하여 영화 정보를 검색하고 추천합니다
   💡 사용자가 영화 정보 검색을 원하므로 가장 적합
   👤 개발자: 최용태
   📈 관련도: 95%
```

### find_mcp - 결과 없음

```
입력: "주식 정보 알려줘"

출력:
🔍 "주식 정보 알려줘" 검색 결과

❌ 적합한 MCP를 찾지 못했습니다.

💬 현재 PlayMCP에 주식/증권 관련 MCP가 등록되어 있지 않습니다.
```

## 기술 스택

- TypeScript / Node.js
- MCP SDK (@modelcontextprotocol/sdk)
- Google Gemini 2.0 Flash Lite (LLM 기반 매칭)

## 비용

- **Railway**: $5/월 (Hobby Plan)
- **Gemini 2.0 Flash Lite**: 무료 (일일 1,500 요청)

## Rate Limit

Gemini 무료 티어 제한:
- 분당 15 요청
- 일일 1,500 요청

## 라이선스

MIT
