import os
import requests
from fastapi import HTTPException
from .base import AIService

class GeminiService(AIService):
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.api_key}"

    def perform_analysis(self, forum_post_text: str, original_source_text: str) -> str:
        prompt = self._build_prompt(forum_post_text, original_source_text)
        payload = self._build_payload(prompt)

        try:
            response = requests.post(self.api_url, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            return self._parse_response(result)
        except requests.RequestException as e:
            print(f"Gemini API Error: {e}")
            raise HTTPException(status_code=500, detail=f"Gemini API request failed: {e}")

    def _build_prompt(self, forum_post_text: str, original_source_text: str) -> str:
        return f'''
            You are a strict, meticulous, and professional localization editor. Your task is to analyze a forum post that contains a user-provided translation (in Traditional Chinese). The original source text is also provided for comparison. Your standards are very high.

            Follow these steps with extreme precision:
            1.  First, return the entire, unmodified text of the original forum post in the 'full_post_text' field.
            2.  Extract the article title from the "標題:" line of the forum post.
            3.  Using the provided 'Original Source Text' as the ground truth, compare it against the translation found in the 'Forum Post Text'. Identify not just obvious mistakes, but also subtle errors in tone, nuance, style, and cultural context. Be critical.
            4.  For each error you find in the translation, you MUST provide the corresponding sentence from the 'Original Source Text' in the 'original_sentence' field. This is non-negotiable.
            5.  Generate a concise, professional one-sentence summary of the translation quality.
            6.  Return your complete analysis ONLY in the specified JSON format. Do not add any commentary before or after the JSON object.

            ---
            Forum Post Text:
            {forum_post_text}
            ---
            Original Source Text:
            {original_source_text}
            ---
        '''

    def _build_payload(self, prompt: str) -> dict:
        return {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "OBJECT",
                    "properties": {
                        "article_title": {"type": "STRING"},
                        "full_post_text": {"type": "STRING"},
                        "analysis_summary": {"type": "STRING"},
                        "errors_found": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "type": {"type": "STRING", "enum": ['Semantic Error', 'Omission', 'Addition', 'Tone Mismatch', 'Mistranslated Term']},
                                    "problematic_translation": {"type": "STRING"},
                                    "original_sentence": {"type": "STRING"},
                                    "suggested_correction": {"type": "STRING"},
                                    "explanation": {"type": "STRING"}
                                },
                                "required": ["type", "problematic_translation", "original_sentence", "suggested_correction", "explanation"]
                            }
                        }
                    },
                    "required": ["article_title", "full_post_text", "analysis_summary", "errors_found"]
                }
            }
        }

    def _parse_response(self, result: dict) -> str:
        if result.get("candidates") and result["candidates"][0].get("content", {}).get("parts", [{}])[0].get("text"):
            return result["candidates"][0]["content"]["parts"][0]["text"]
        else:
            print("Unexpected Gemini API response structure:", result)
            raise HTTPException(status_code=500, detail="Received an unexpected response format from the Gemini API.")
