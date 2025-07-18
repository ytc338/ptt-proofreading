import os
from .base import AIService
from .gemini import GeminiService
from .openai import OpenAIService

def get_ai_service() -> AIService:
    provider = os.getenv("AI_PROVIDER", "gemini").lower()
    if provider == "openai":
        return OpenAIService()
    elif provider == "gemini":
        return GeminiService()
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")
