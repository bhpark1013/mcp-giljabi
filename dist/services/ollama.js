/**
 * Ollama 임베딩 클라이언트
 * 로컬 Ollama 서버를 통해 텍스트 임베딩을 생성합니다.
 */
const OLLAMA_BASE_URL = 'http://localhost:11434';
const EMBEDDING_MODEL = 'mxbai-embed-large';
/**
 * 텍스트를 벡터로 변환합니다
 */
export async function embed(text) {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: EMBEDDING_MODEL,
            prompt: text,
        }),
    });
    if (!response.ok) {
        throw new Error(`Ollama embedding error: ${response.status}. Ollama가 실행 중인지 확인하세요.`);
    }
    const data = await response.json();
    return data.embedding;
}
/**
 * 여러 텍스트를 한 번에 임베딩합니다
 */
export async function embedBatch(texts) {
    const embeddings = [];
    for (const text of texts) {
        const embedding = await embed(text);
        embeddings.push(embedding);
    }
    return embeddings;
}
/**
 * Ollama 서버 연결 상태를 확인합니다
 */
export async function checkOllamaConnection() {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        return response.ok;
    }
    catch {
        return false;
    }
}
/**
 * 임베딩 모델이 설치되어 있는지 확인합니다
 */
export async function checkEmbeddingModel() {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        if (!response.ok)
            return false;
        const data = await response.json();
        const models = data.models || [];
        return models.some((m) => m.name.includes(EMBEDDING_MODEL));
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=ollama.js.map