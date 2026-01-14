/**
 * Ollama 임베딩 클라이언트
 * 로컬 Ollama 서버를 통해 텍스트 임베딩을 생성합니다.
 */
/**
 * 텍스트를 벡터로 변환합니다
 */
export declare function embed(text: string): Promise<number[]>;
/**
 * 여러 텍스트를 한 번에 임베딩합니다
 */
export declare function embedBatch(texts: string[]): Promise<number[][]>;
/**
 * Ollama 서버 연결 상태를 확인합니다
 */
export declare function checkOllamaConnection(): Promise<boolean>;
/**
 * 임베딩 모델이 설치되어 있는지 확인합니다
 */
export declare function checkEmbeddingModel(): Promise<boolean>;
//# sourceMappingURL=ollama.d.ts.map