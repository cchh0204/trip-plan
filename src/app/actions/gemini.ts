'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 무료 할당량이 있는 모델 우선순위 리스트
const MODELS = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash-lite'];

export async function analyzePlace(query: string) {
  const prompt = `
    사용자가 일본 여행을 위해 입력한 장소 정보: "${query}"
    
    이 정보를 분석하여 다음 JSON 형식으로 응답해줘. 
    만약 여러 장소가 포함되어 있다면 가장 핵심적인 한 곳만 분석해줘.
    JSON 외에 다른 텍스트는 포함하지 마.

    {
      "name": "장소 이름 (한국어)",
      "originalName": "장소 이름 (일본어 또는 영어)",
      "address": "상세 주소 (일본어/한국어 포함)",
      "description": "이 장소에 대한 간단한 1줄 설명",
      "category": "음식점, 카페, 관광지, 쇼핑, 숙소 중 하나",
      "lat": 위도(숫자, 모르면 0),
      "lng": 경도(숫자, 모르면 0)
    }
  `;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // JSON 추출 (Markdown code block 제거 등)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log(`[Gemini] 성공: ${modelName} 모델 사용`);
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn(`[Gemini] ${modelName} 실패, 다음 모델 시도...`, error instanceof Error ? error.message : error);
      continue; // 즉시 다음 모델로 전환
    }
  }

  throw new Error('모든 AI 모델이 실패했습니다. 잠시 후 다시 시도해주세요.');
}
