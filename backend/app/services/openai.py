import os
import requests
from fastapi import HTTPException
from .base import AIService

class OpenAIService(AIService):
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is not set in environment variables.")
        self.api_url = "https://api.openai.com/v1/chat/completions"

    def perform_analysis(self, forum_post_text: str, original_source_text: str) -> str:
        system_prompt, user_prompt = self._build_prompts(forum_post_text, original_source_text)
        headers = self._build_headers()
        payload = self._build_payload(system_prompt, user_prompt)

        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            return self._parse_response(result)
        except requests.RequestException as e:
            print(f"OpenAI API Error: {e}")
            raise HTTPException(status_code=500, detail=f"OpenAI API request failed: {e}")

    def _build_prompts(self, forum_post_text: str, original_source_text: str) -> tuple[str, str]:
        system_prompt = "You are a strict, meticulous, and professional localization editor. Your task is to analyze a forum post that contains a user-provided translation (in Traditional Chinese). The original source text is also provided for comparison. Your standards are very high."
        user_prompt = f'''
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
        return system_prompt, user_prompt

    def _build_headers(self) -> dict:
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

    def _build_payload(self, system_prompt: str, user_prompt: str) -> dict:
        return {
            "model": "gpt-4-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"}
        }

    def _parse_response(self, result: dict) -> str:
        if result.get("choices") and result["choices"][0].get("message", {}).get("content"):
            return result["choices"][0]["message"]["content"]
        else:
            print("Unexpected OpenAI API response structure:", result)
            raise HTTPException(status_code=500, detail="Received an unexpected response from OpenAI API.")
