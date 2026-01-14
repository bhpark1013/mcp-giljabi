/**
 * Google Gemini 임베딩 서비스
 * gemini-embedding-001 모델 사용 (무료 티어)
 */
declare const EMBEDDING_DIMENSIONS = 768;
/**
 * 텍스트를 임베딩 벡터로 변환합니다
 */
export declare function embed(text: string): Promise<number[]>;
/**
 * 여러 텍스트를 한 번에 임베딩합니다 (배치 처리)
 */
export declare function embedBatch(texts: string[]): Promise<number[][]>;
/**
 * Gemini API 연결 확인
 */
export declare function checkEmbeddingService(): Promise<boolean>;
export { EMBEDDING_DIMENSIONS };
//# sourceMappingURL=embedding.d.ts.map