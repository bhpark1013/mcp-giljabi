/**
 * OpenAI 임베딩 서비스
 * text-embedding-3-small 모델 사용
 */

import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

let openaiClient: OpenAI | null = null;

/**
 * OpenAI 클라이언트 초기화
 */
function getClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * 텍스트를 임베딩 벡터로 변환합니다
 */
export async function embed(text: string): Promise<number[]> {
  const client = getClient();

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0].embedding;
}

/**
 * 여러 텍스트를 한 번에 임베딩합니다 (배치 처리)
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const client = getClient();

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data.map(item => item.embedding);
}

/**
 * OpenAI API 연결 확인
 */
export async function checkEmbeddingService(): Promise<boolean> {
  try {
    const client = getClient();
    // 간단한 테스트 임베딩
    await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: 'test',
      dimensions: EMBEDDING_DIMENSIONS,
    });
    return true;
  } catch (error) {
    console.error('OpenAI 연결 실패:', error);
    return false;
  }
}

export { EMBEDDING_DIMENSIONS };
