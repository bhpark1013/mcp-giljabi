/**
 * 하이브리드 매칭 로직
 * 키워드 매칭 + 시맨틱 검색을 조합하여 정확도를 높입니다
 */
// 키워드-카테고리 매핑
const KEYWORD_MAP = {
    // 영화/미디어
    '영화': ['영화', 'movie', 'tmdb', '박스오피스', '상영', '개봉', 'digging'],
    '음악': ['음악', '노래', '멜론', 'melon', '지니', 'genie', '차트', '플레이리스트', '아티스트'],
    '유튜브': ['유튜브', 'youtube', '영상', '동영상', '채널'],
    // 지도/위치
    '맛집': ['맛집', '식당', '음식점', '레스토랑', '카페', '맛있는', '먹을', '배고파'],
    '지도': ['지도', '위치', '장소', '길찾기', '경로', '카카오맵', '네비'],
    '여행': ['여행', '관광', '숙박', '호텔', '비행기', '항공', '투어'],
    // 날씨/환경
    '날씨': ['날씨', '기온', '비가', '눈이', '우산', '기상', '온도', 'weather', '흐림', '맑음', '날씨알려', '날씨정보', '일기예보'],
    // 교육/학교
    '학교': ['학교', '급식', '시간표', '학생', '교육'],
    '급식': ['급식', '메뉴', '학교'],
    // 교통
    '지하철': ['지하철', '전철', '역', '노선', '도착', '출발'],
    '택배': ['택배', '배송', '배달', '운송', '물류', '추적'],
    '교통': ['교통', '버스', '지하철', '대중교통'],
    // 금융/쇼핑
    '선물': ['선물', '기프트', '카카오톡', '기념일'],
    // 건강
    '약': ['약', '의약품', '병원', '약국', '건강', '복용'],
    '병원': ['병원', '의원', '진료', '의사', '응급'],
    // 게임/엔터테인먼트
    '게임': ['게임', '퀴즈', '포켓몬', '방탈출', '놀이'],
    '운세': ['운세', '타로', '사주', '점', '행운'],
    // 일정/생산성
    '할일': ['할일', '투두', 'todo', '일정', '스케줄', '캘린더'],
    '메모': ['메모', '노트', '기록', '저장'],
    // 뉴스/정보
    '뉴스': ['뉴스', '기사', '소식', '정보', 'news'],
    '검색': ['검색', '찾기', '조회'],
    // 법률/행정
    '법률': ['법률', '법', '판례', '소송', '변호사'],
    '공공': ['공공', '혜택', '지원', '복지', '정부'],
};
// MCP 이름에 포함된 키워드로 직접 매핑
const MCP_NAME_KEYWORDS = {
    'Movie Digging': ['영화', 'movie', '상영'],
    '멜론': ['음악', '노래', '멜론', 'melon'],
    'genie': ['음악', '노래', '지니'],
    '카카오맵': ['맛집', '지도', '위치', '장소', '길찾기'],
    'KakaoMap': ['맛집', '지도', '위치'],
    '학교 급식 정보': ['급식', '학교', '메뉴'],
    '학교 시간표': ['시간표', '학교'],
    '서울 실시간 지하철': ['지하철', '전철', '도착'],
    '택배비서': ['택배', '배송', '배달'],
    '투두메이트': ['할일', '투두', '일정'],
    'Weather Life': ['날씨', '기온', '우산', '맑음', 'weather', '일기예보', '날씨알려'],
    'Weather': ['날씨', '기온', '우산', '맑음', 'weather'],
    '온열질환': ['날씨', '더위', '폭염', '기온'],
    'silver care': ['날씨', '더위', '폭염'],
    '병원·약국 정보': ['병원', '약국', '의료'],
    '약잘알': ['약', '의약품', '복용'],
    '우리의 식탁': ['레시피', '요리', '음식'],
    'tmdb': ['영화', 'movie'],
    '박스오피스': ['영화', '박스오피스'],
    '네이버 검색': ['검색', '네이버'],
    'YouTube': ['유튜브', '영상', '동영상'],
};
/**
 * 텍스트에서 키워드를 추출합니다
 */
export function extractKeywords(text) {
    const normalizedText = text.toLowerCase();
    const foundKeywords = [];
    for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
        for (const keyword of keywords) {
            if (normalizedText.includes(keyword.toLowerCase())) {
                foundKeywords.push(category);
                break;
            }
        }
    }
    return [...new Set(foundKeywords)];
}
/**
 * MCP 이름/설명에서 매칭되는 키워드를 찾습니다
 */
export function matchMcpKeywords(mcpName, mcpDescription) {
    const matchedKeywords = [];
    const combinedText = `${mcpName} ${mcpDescription}`.toLowerCase();
    // MCP 이름 직접 매핑 확인
    for (const [name, keywords] of Object.entries(MCP_NAME_KEYWORDS)) {
        if (mcpName.includes(name) || name.includes(mcpName)) {
            matchedKeywords.push(...keywords);
        }
    }
    // 일반 키워드 매핑 확인
    for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
        for (const keyword of keywords) {
            if (combinedText.includes(keyword.toLowerCase())) {
                matchedKeywords.push(category);
                break;
            }
        }
    }
    return [...new Set(matchedKeywords)];
}
/**
 * 키워드 기반 점수를 계산합니다
 */
export function calculateKeywordScore(queryKeywords, mcpKeywords) {
    if (queryKeywords.length === 0 || mcpKeywords.length === 0) {
        return 0;
    }
    const intersection = queryKeywords.filter((k) => mcpKeywords.includes(k));
    // Jaccard 유사도 + 매칭 보너스
    const score = intersection.length / Math.max(queryKeywords.length, 1);
    return Math.min(score, 1);
}
/**
 * 하이브리드 점수를 계산합니다 (키워드 50% + 임베딩 50%)
 */
export function calculateHybridScore(keywordScore, embeddingScore, keywordWeight = 0.6 // 키워드 가중치를 높임
) {
    return keywordScore * keywordWeight + embeddingScore * (1 - keywordWeight);
}
//# sourceMappingURL=matcher.js.map