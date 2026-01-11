/**
 * Google Gemini 임베딩 서비스
 * gemini-embedding-001 모델 사용 (무료 티어)
 */

import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';

const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768; // 768, 1536, 3072 중 선택 가능

let genAI: GoogleGenerativeAI | null = null;

/**
 * Gemini 클라이언트 초기화
 */
function getClient(): GoogleGenerativeAI {
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
 * 텍스트를 임베딩 벡터로 변환합니다
 */
export async function embed(text: string): Promise<number[]> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });

  const result = await model.embedContent({
    content: { parts: [{ text }], role: 'user' },
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });

  return result.embedding.values;
}

/**
 * 여러 텍스트를 한 번에 임베딩합니다 (배치 처리)
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });

  const results = await model.batchEmbedContents({
    requests: texts.map((text) => ({
      content: { parts: [{ text }], role: 'user' as const },
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    })),
  });

  return results.embeddings.map((e) => e.values);
}

/**
 * Gemini API 연결 확인
 */
export async function checkEmbeddingService(): Promise<boolean> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });

    await model.embedContent({
      content: { parts: [{ text: 'test' }], role: 'user' },
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });
    return true;
  } catch (error) {
    console.error('Gemini 연결 실패:', error);
    return false;
  }
}

export { EMBEDDING_DIMENSIONS };
