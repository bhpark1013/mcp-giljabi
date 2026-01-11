# MCP 길잡이 (mcp-giljabi)

사용자의 요청에 맞는 PlayMCP를 찾아주는 MCP 서버입니다.

## 기능

- **find_mcp**: 사용자 요청에 맞는 MCP를 하이브리드 검색으로 찾습니다
- **add_mcp**: MCP 설치 방법을 안내합니다

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
# .env 파일에 GEMINI_API_KEY 설정 후
npm run test-search
```

### 2. MCP Inspector로 테스트

MCP Inspector는 MCP 서버를 웹 UI로 테스트할 수 있는 도구입니다.

```bash
# 빌드 후 실행
npm run build
GEMINI_API_KEY=your-api-key npm run inspector
```

브라우저에서 http://localhost:5173 접속하여 테스트할 수 있습니다.

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

## Railway 배포

### 1. GitHub 레포지토리 생성 및 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Railway 배포

1. [railway.app](https://railway.app) 접속
2. GitHub 로그인
3. "New Project" → "Deploy from GitHub repo"
4. 레포지토리 선택
5. 환경 변수 설정:
   - `GEMINI_API_KEY`: Gemini API 키

### 3. 배포 완료

Railway가 자동으로 빌드 및 배포합니다.

## 사용 예시

### find_mcp

```
입력: "영화 정보를 검색하고 싶어"

출력:
🔍 "영화 정보를 검색하고 싶어" 검색 결과 (3개)

1. **Movie Digging**
   📝 TMDb API를 활용하여 영화 정보를 검색하고 추천합니다
   👤 개발자: 최용태
   📊 월간 호출: 156회
   🔗 https://playmcp.kakao.com/mcp/61
   📈 관련도: 85%
```

### add_mcp

```
입력: mcpId = "61"

출력:
🚀 **Movie Digging** 추가하기

📎 링크: https://playmcp.kakao.com/mcp/61

📋 **설치 방법:**
1. 아래 링크에 접속하세요
2. 카카오 계정으로 로그인하세요
3. '추가하기' 버튼을 클릭하세요
4. Claude Desktop을 재시작하세요
```

## 캐싱

- MCP 데이터와 임베딩은 `src/data/embeddings.json`에 캐싱됩니다
- 캐시 유효기간: 24시간
- 서버 시작 시 캐시가 없거나 만료되면 자동으로 새로 생성합니다

## 기술 스택

- TypeScript / Node.js
- MCP SDK (@modelcontextprotocol/sdk)
- Google Gemini Embeddings (gemini-embedding-001)
- 하이브리드 검색 (키워드 매칭 60% + 시맨틱 검색 40%)
  - 한국어 키워드 매핑으로 정확도 향상
  - 코사인 유사도 기반 임베딩 검색

## 비용

- **Railway**: $5/월 (Hobby Plan)
- **Gemini Embeddings**: 무료 (100 RPM, 1,000 RPD)

## 라이선스

MIT
