/**
 * 벡터 유사도 계산 유틸리티
 */
/**
 * 코사인 유사도를 계산합니다
 * @param a 첫 번째 벡터
 * @param b 두 번째 벡터
 * @returns -1 ~ 1 사이의 유사도 값 (1에 가까울수록 유사)
 */
export declare function cosineSimilarity(a: number[], b: number[]): number;
/**
 * 여러 벡터 중 가장 유사한 것들을 찾습니다
 * @param query 쿼리 벡터
 * @param candidates 후보 벡터들
 * @param topK 반환할 개수
 * @returns 유사도 순으로 정렬된 인덱스와 유사도 배열
 */
export declare function findTopSimilar(query: number[], candidates: number[][], topK?: number): {
    index: number;
    similarity: number;
}[];
//# sourceMappingURL=similarity.d.ts.map