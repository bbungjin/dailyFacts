export interface DailyFact {
  date: string; // YYYY-MM-DD 형식
  image: string; // 이미지 URL
  content: string; // 흥미로운 사실 내용
  title?: string; // 선택적 제목
}

export interface DailyFactsData {
  facts: DailyFact[];
} 