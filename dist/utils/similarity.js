/**
 * 벡터 유사도 계산 유틸리티
 */
/**
 * 코사인 유사도를 계산합니다
 * @param a 첫 번째 벡터
 * @param b 두 번째 벡터
 * @returns -1 ~ 1 사이의 유사도 값 (1에 가까울수록 유사)
 */
export function cosineSimilarity(a, b) {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same length');
    }
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        magnitudeA += a[i] * a[i];
        magnitudeB += b[i] * b[i];
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }
    return dotProduct / (magnitudeA * magnitudeB);
}
/**
 * 여러 벡터 중 가장 유사한 것들을 찾습니다
 * @param query 쿼리 벡터
 * @param candidates 후보 벡터들
 * @param topK 반환할 개수
 * @returns 유사도 순으로 정렬된 인덱스와 유사도 배열
 */
export function findTopSimilar(query, candidates, topK = 5) {
    const similarities = candidates.map((candidate, index) => ({
        index,
        similarity: cosineSimilarity(query, candidate),
    }));
    return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
}
//# sourceMappingURL=similarity.js.map